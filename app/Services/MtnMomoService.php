<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class MtnMomoService
{
    private $baseUrl;
    private $subscriptionKey;
    private $targetEnvironment;
    private $apiUser;
    private $apiKey;
    private $callbackUrl;

    public function __construct()
    {
        $this->baseUrl = config('services.mtn_momo.base_url', 'https://sandbox.momodeveloper.mtn.com');
        $this->subscriptionKey = config('services.mtn_momo.subscription_key');
        $this->targetEnvironment = config('services.mtn_momo.target_environment', 'sandbox');
        $this->apiUser = config('services.mtn_momo.api_user');
        $this->apiKey = config('services.mtn_momo.api_key');
        $this->callbackUrl = config('services.mtn_momo.callback_url');
    }

    /**
     * Get access token for API authentication
     */
    public function getAccessToken()
    {
        $cacheKey = 'mtn_momo_access_token';
        
        // Check if we have a cached token
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Basic ' . base64_encode($this->apiUser . ':' . $this->apiKey),
                'X-Reference-Id' => $this->generateReferenceId(),
                'X-Target-Environment' => $this->targetEnvironment,
                'Ocp-Apim-Subscription-Key' => $this->subscriptionKey,
            ])->post($this->baseUrl . '/collection/token/');

            if ($response->successful()) {
                $token = $response->json('access_token');
                
                // Cache the token for 55 minutes (MTN tokens typically expire in 1 hour)
                Cache::put($cacheKey, $token, 3300);
                
                return $token;
            }

            Log::error('MTN MoMo token request failed', [
                'status' => $response->status(),
                'response' => $response->json()
            ]);

            return null;
        } catch (\Exception $e) {
            Log::error('MTN MoMo token request exception', [
                'message' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Create a payment request
     */
    public function createPayment($amount, $phoneNumber, $description, $externalId = null)
    {
        $accessToken = $this->getAccessToken();
        
        if (!$accessToken) {
            return [
                'success' => false,
                'message' => 'Failed to get access token'
            ];
        }

        $referenceId = $this->generateReferenceId();
        $externalId = $externalId ?: $referenceId;

        $payload = [
            'amount' => $amount,
            'currency' => 'EUR',
            'externalId' => $externalId,
            'payer' => [
                'partyIdType' => 'MSISDN',
                'partyId' => $this->formatPhoneNumber($phoneNumber)
            ],
            'payerMessage' => $description,
            'payeeNote' => $description
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'X-Reference-Id' => $referenceId,
                'X-Target-Environment' => $this->targetEnvironment,
                'Ocp-Apim-Subscription-Key' => $this->subscriptionKey,
                'Content-Type' => 'application/json'
            ])->post($this->baseUrl . '/collection/v1_0/requesttopay', $payload);

            if ($response->status() === 202) {
                // Payment request created successfully
                return [
                    'success' => true,
                    'reference_id' => $referenceId,
                    'external_id' => $externalId,
                    'status' => 'pending',
                    'message' => 'Payment request created successfully'
                ];
            }

            Log::error('MTN MoMo payment request failed', [
                'status' => $response->status(),
                'response' => $response->json(),
                'payload' => $payload
            ]);

            return [
                'success' => false,
                'message' => 'Failed to create payment request: ' . ($response->json('message') ?? 'Unknown error')
            ];

        } catch (\Exception $e) {
            Log::error('MTN MoMo payment request exception', [
                'message' => $e->getMessage(),
                'payload' => $payload
            ]);

            return [
                'success' => false,
                'message' => 'Payment request failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Check payment status
     */
    public function checkPaymentStatus($referenceId)
    {
        $accessToken = $this->getAccessToken();
        
        if (!$accessToken) {
            return [
                'success' => false,
                'message' => 'Failed to get access token'
            ];
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $accessToken,
                'X-Target-Environment' => $this->targetEnvironment,
                'Ocp-Apim-Subscription-Key' => $this->subscriptionKey,
            ])->get($this->baseUrl . '/collection/v1_0/requesttopay/' . $referenceId);

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'status' => $data['status'] ?? 'unknown',
                    'amount' => $data['amount'] ?? 0,
                    'currency' => $data['currency'] ?? 'EUR',
                    'external_id' => $data['externalId'] ?? null,
                    'payer_message' => $data['payerMessage'] ?? '',
                    'payee_note' => $data['payeeNote'] ?? '',
                    'financial_transaction_id' => $data['financialTransactionId'] ?? null,
                    'reason' => $data['reason'] ?? null
                ];
            }

            Log::error('MTN MoMo payment status check failed', [
                'status' => $response->status(),
                'response' => $response->json(),
                'reference_id' => $referenceId
            ]);

            return [
                'success' => false,
                'message' => 'Failed to check payment status'
            ];

        } catch (\Exception $e) {
            Log::error('MTN MoMo payment status check exception', [
                'message' => $e->getMessage(),
                'reference_id' => $referenceId
            ]);

            return [
                'success' => false,
                'message' => 'Status check failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Generate a unique reference ID
     */
    private function generateReferenceId()
    {
        return uniqid('koabiga_', true);
    }

    /**
     * Format phone number for MTN MoMo API
     */
    private function formatPhoneNumber($phoneNumber)
    {
        // Remove any non-digit characters
        $phoneNumber = preg_replace('/[^0-9]/', '', $phoneNumber);
        
        // If it starts with 0, replace with country code
        if (substr($phoneNumber, 0, 1) === '0') {
            $phoneNumber = '256' . substr($phoneNumber, 1);
        }
        
        // If it doesn't start with country code, add it
        if (substr($phoneNumber, 0, 3) !== '256') {
            $phoneNumber = '256' . $phoneNumber;
        }
        
        return $phoneNumber;
    }

    /**
     * Handle payment callback from MTN MoMo
     */
    public function handleCallback($data)
    {
        Log::info('MTN MoMo callback received', $data);

        // Extract relevant information
        $referenceId = $data['referenceId'] ?? null;
        $status = $data['status'] ?? null;
        $amount = $data['amount'] ?? 0;
        $currency = $data['currency'] ?? 'EUR';
        $externalId = $data['externalId'] ?? null;
        $financialTransactionId = $data['financialTransactionId'] ?? null;

        if (!$referenceId) {
            Log::error('MTN MoMo callback missing reference ID', $data);
            return false;
        }

        // Here you would update your payment record in the database
        // This should be implemented based on your payment model structure
        
        return [
            'reference_id' => $referenceId,
            'status' => $status,
            'amount' => $amount,
            'currency' => $currency,
            'external_id' => $externalId,
            'financial_transaction_id' => $financialTransactionId
        ];
    }
} 