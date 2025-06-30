<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Handle member login with phone number and PIN
     */
    public function login(Request $request): JsonResponse
    {
        try {
            // Server-side validation
            $validator = Validator::make($request->all(), [
                'phone_number' => 'required|numeric',
                'pin' => 'required|numeric|digits:5',
            ], [
                'phone_number.required' => 'Phone number is required.',
                'phone_number.numeric' => 'Phone number must contain only digits.',
                'pin.required' => 'PIN is required.',
                'pin.numeric' => 'PIN must contain only digits.',
                'pin.digits' => 'PIN must be exactly 5 digits.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Hardcoded credentials for demonstration
            $validPhoneNumber = '250781234567';
            $validPin = '12345';

            $phoneNumber = $request->input('phone_number');
            $pin = $request->input('pin');

            // Check credentials
            if ($phoneNumber === $validPhoneNumber && $pin === $validPin) {
                return response()->json([
                    'message' => 'Login successful',
                    'user' => [
                        'phone_number' => $phoneNumber,
                        'role' => 'member'
                    ]
                ], 200);
            } else {
                return response()->json([
                    'message' => 'Invalid credentials'
                ], 401);
            }

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during login',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
