<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::select('id', 'christian_name', 'family_name', 'email', 'role', 'created_at');

            // Filter by role if provided
            if ($request->has('role') && $request->role) {
                $query->where('role', $request->role);
            }

            $users = $query->get();

            return response()->json([
                'success' => true,
                'data' => $users
            ]);
        } catch (\Exception $e) {
            Log::error('User index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch users: ' . $e->getMessage()
            ], 500);
        }
    }

    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_users' => User::count(),
                'admin_users' => User::where('role', 'admin')->count(),
                'unit_leader_users' => User::where('role', 'unit_leader')->count(),
                'member_users' => User::where('role', 'member')->count(),
                'active_today' => User::where('last_login_at', '>=', now()->startOfDay())->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('User statistics error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch user statistics: ' . $e->getMessage()
            ], 500);
        }
    }
} 