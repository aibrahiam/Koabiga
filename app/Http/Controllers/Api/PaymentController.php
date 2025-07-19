<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeeApplication;
use App\Models\Payment;
use App\Services\MtnMomoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    protected $mtnMomoService;

    public function __construct(MtnMomoService $mtnMomoService)
    {
        $this->mtnMomoService = $mtnMomoService;
    }

    /**
     * Initiate a payment for a fee
     */
    public function initiatePayment(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'phone_number' => 'required|string|min:10|max:15',
                'amount' => 'required|numeric|min:0.01',
                'description' => 'required|string',
                'fee_application_ids' => 'sometimes|array',
                'fee_application_ids.*' => 'sometimes|exists:fee_applications,id',
                'payment_type' => 'sometimes|string|in:single,bulk',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $paymentType = $request->input('payment_type', 'single');
            $feeApplicationIds = $request->input('fee_application_ids', []);
            $amount = $request->input('amount');
            $description = $request->input('description');

            // For backward compatibility, handle single fee payment
            if ($paymentType === 'single' && $request->has('fee_application_id')) {
                $feeApplicationId = $request->input('fee_application_id');
                $feeApplicationIds = [$feeApplicationId];
            }

            // Validate fee applications if provided
            if (!empty($feeApplicationIds)) {
                $feeApplications = FeeApplication::whereIn('id', $feeApplicationIds)
                    ->where('user_id', $user->id)
                    ->with('feeRule')
                    ->get();

                if ($feeApplications->count() !== count($feeApplicationIds)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'One or more fee applications not found or not authorized'
                    ], 404);
                }

                // Check if any fees are already paid
                $paidFees = $feeApplications->where('status', 'paid');
                if ($paidFees->count() > 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Some fees have already been paid'
                    ], 400);
                }

                // Check if there are already pending payments for these fees
                $existingPayments = Payment::whereIn('fee_application_id', $feeApplicationIds)
                    ->where('status', 'pending')
                    ->get();

                if ($existingPayments->count() > 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Payments are already pending for some of these fees',
                        'pending_payments' => $existingPayments->pluck('reference_id')
                    ], 400);
                }

                // Verify total amount matches
                $totalFeeAmount = $feeApplications->sum('amount');
                if (abs($totalFeeAmount - $amount) > 0.01) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Amount mismatch. Expected: ' . $totalFeeAmount . ', Provided: ' . $amount
                    ], 400);
                }
            }

            // Create payment request with MTN MoMo
            $externalId = $paymentType === 'bulk' 
                ? "bulk_fees_user_{$user->id}_" . time()
                : "fee_{$feeApplicationIds[0]}_user_{$user->id}";

            $paymentResult = $this->mtnMomoService->createPayment(
                $amount,
                $request->phone_number,
                $description,
                $externalId
            );

            if (!$paymentResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $paymentResult['message']
                ], 500);
            }

            // Create payment record(s) in database
            $payments = [];
            if (!empty($feeApplicationIds)) {
                // Create individual payment records for each fee application
                foreach ($feeApplicationIds as $feeApplicationId) {
                    $feeApplication = $feeApplications->firstWhere('id', $feeApplicationId);
                    $individualAmount = $feeApplication->amount;
                    
                    $payment = Payment::create([
                        'user_id' => $user->id,
                        'fee_application_id' => $feeApplicationId,
                        'reference_id' => $paymentResult['reference_id'],
                        'external_id' => $paymentResult['external_id'],
                        'amount' => $individualAmount,
                        'currency' => 'EUR',
                        'phone_number' => $request->phone_number,
                        'description' => $description,
                        'status' => 'pending',
                        'payment_method' => 'mtn_momo',
                    ]);
                    
                    $payments[] = $payment;
                }
            } else {
                // Create a single payment record without fee application association
                $payment = Payment::create([
                    'user_id' => $user->id,
                    'fee_application_id' => null,
                    'reference_id' => $paymentResult['reference_id'],
                    'external_id' => $paymentResult['external_id'],
                    'amount' => $amount,
                    'currency' => 'EUR',
                    'phone_number' => $request->phone_number,
                    'description' => $description,
                    'status' => 'pending',
                    'payment_method' => 'mtn_momo',
                ]);
                
                $payments[] = $payment;
            }

            return response()->json([
                'success' => true,
                'message' => 'Payment initiated successfully',
                'data' => [
                    'payment_id' => $payments[0]->id,
                    'reference_id' => $paymentResult['reference_id'],
                    'amount' => $amount,
                    'currency' => 'EUR',
                    'phone_number' => $request->phone_number,
                    'description' => $description,
                    'status' => 'pending',
                    'payment_type' => $paymentType,
                    'fee_applications_count' => count($feeApplicationIds),
                    'fee_applications' => !empty($feeApplicationIds) ? $feeApplications->map(function($fa) {
                        return [
                            'id' => $fa->id,
                            'fee_rule' => [
                                'name' => $fa->feeRule->name,
                                'description' => $fa->feeRule->description,
                            ],
                            'due_date' => $fa->due_date,
                        ];
                    }) : []
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Payment initiation failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment initiation failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check payment status
     */
    public function checkPaymentStatus(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'reference_id' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get all payment records with this reference_id
            $payments = Payment::where('reference_id', $request->reference_id)
                ->where('user_id', $user->id)
                ->with(['feeApplication.feeRule'])
                ->get();

            if ($payments->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment not found'
                ], 404);
            }

            // Check status with MTN MoMo
            $statusResult = $this->mtnMomoService->checkPaymentStatus($request->reference_id);

            if (!$statusResult['success']) {
                return response()->json([
                    'success' => false,
                    'message' => $statusResult['message']
                ], 500);
            }

            // Update all payment records with this reference_id if status has changed
            $firstPayment = $payments->first();
            if ($statusResult['status'] !== $firstPayment->status) {
                foreach ($payments as $payment) {
                    $payment->update([
                        'status' => $statusResult['status'],
                        'financial_transaction_id' => $statusResult['financial_transaction_id'],
                        'payer_message' => $statusResult['payer_message'],
                        'payee_note' => $statusResult['payee_note'],
                        'reason' => $statusResult['reason'],
                        'paid_at' => $statusResult['status'] === 'SUCCESSFUL' ? now() : null,
                    ]);

                    // If payment is successful, update fee application status
                    if ($statusResult['status'] === 'SUCCESSFUL' && $payment->feeApplication) {
                        $payment->feeApplication->update([
                            'status' => 'paid',
                            'paid_date' => now(),
                        ]);
                    }
                }
            }

            // Calculate total amount for all payments
            $totalAmount = $payments->sum('amount');
            $feeApplications = $payments->map(function($payment) {
                return $payment->feeApplication ? [
                    'id' => $payment->feeApplication->id,
                    'status' => $payment->feeApplication->status,
                    'fee_rule' => [
                        'name' => $payment->feeApplication->feeRule->name,
                        'description' => $payment->feeApplication->feeRule->description,
                    ],
                ] : null;
            })->filter();

            return response()->json([
                'success' => true,
                'data' => [
                    'payment_id' => $firstPayment->id,
                    'reference_id' => $firstPayment->reference_id,
                    'amount' => $totalAmount,
                    'currency' => $firstPayment->currency,
                    'status' => $firstPayment->status,
                    'phone_number' => $firstPayment->phone_number,
                    'description' => $firstPayment->description,
                    'financial_transaction_id' => $firstPayment->financial_transaction_id,
                    'paid_at' => $firstPayment->paid_at,
                    'payments_count' => $payments->count(),
                    'fee_applications' => $feeApplications->values(),
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Payment status check failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id(),
                'reference_id' => $request->reference_id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Payment status check failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user's payment history
     */
    public function getPaymentHistory(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $payments = Payment::where('user_id', $user->id)
                ->with(['feeApplication.feeRule'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            $formattedPayments = $payments->getCollection()->map(function ($payment) {
                return [
                    'id' => $payment->id,
                    'reference_id' => $payment->reference_id,
                    'amount' => $payment->amount,
                    'currency' => $payment->currency,
                    'status' => $payment->status,
                    'phone_number' => $payment->phone_number,
                    'description' => $payment->description,
                    'payment_method' => $payment->payment_method,
                    'financial_transaction_id' => $payment->financial_transaction_id,
                    'paid_at' => $payment->paid_at,
                    'created_at' => $payment->created_at,
                    'fee_application' => $payment->feeApplication ? [
                        'id' => $payment->feeApplication->id,
                        'fee_rule' => [
                            'name' => $payment->feeApplication->feeRule->name,
                            'description' => $payment->feeApplication->feeRule->description,
                        ],
                    ] : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'payments' => $formattedPayments,
                    'pagination' => [
                        'current_page' => $payments->currentPage(),
                        'last_page' => $payments->lastPage(),
                        'per_page' => $payments->perPage(),
                        'total' => $payments->total(),
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Payment history fetch failed', [
                'error' => $e->getMessage(),
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch payment history: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle MTN MoMo callback
     */
    public function handleCallback(Request $request): JsonResponse
    {
        try {
            Log::info('MTN MoMo callback received', $request->all());

            $callbackData = $request->all();
            $referenceId = $callbackData['referenceId'] ?? null;

            if (!$referenceId) {
                Log::error('MTN MoMo callback missing reference ID', $callbackData);
                return response()->json(['success' => false, 'message' => 'Missing reference ID'], 400);
            }

            // Find the payment
            $payment = Payment::where('reference_id', $referenceId)->first();

            if (!$payment) {
                Log::error('MTN MoMo callback payment not found', ['reference_id' => $referenceId]);
                return response()->json(['success' => false, 'message' => 'Payment not found'], 404);
            }

            // Process the callback
            $result = $this->mtnMomoService->handleCallback($callbackData);

            if ($result) {
                // Update payment record
                $payment->update([
                    'status' => $result['status'],
                    'financial_transaction_id' => $result['financial_transaction_id'],
                    'callback_data' => $callbackData,
                    'paid_at' => $result['status'] === 'SUCCESSFUL' ? now() : null,
                ]);

                // If payment is successful, update fee application
                if ($result['status'] === 'SUCCESSFUL' && $payment->feeApplication) {
                    $payment->feeApplication->update([
                        'status' => 'paid',
                        'paid_date' => now(),
                    ]);
                }

                Log::info('MTN MoMo callback processed successfully', [
                    'reference_id' => $referenceId,
                    'status' => $result['status']
                ]);
            }

            return response()->json(['success' => true]);

        } catch (\Exception $e) {
            Log::error('MTN MoMo callback processing failed', [
                'error' => $e->getMessage(),
                'callback_data' => $request->all()
            ]);

            return response()->json(['success' => false, 'message' => 'Callback processing failed'], 500);
        }
    }
} 