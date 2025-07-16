<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\LoginSession;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class LoginSessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = LoginSession::with('user')
            ->orderBy('created_at', 'desc');

        // Filter by user if provided
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by status if provided
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Filter by date range if provided
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $sessions = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $sessions->items(),
            'pagination' => [
                'current_page' => $sessions->currentPage(),
                'last_page' => $sessions->lastPage(),
                'per_page' => $sessions->perPage(),
                'total' => $sessions->total(),
            ]
        ]);
    }

    public function statistics(): JsonResponse
    {
        $stats = [
            'total_sessions' => LoginSession::count(),
            'active_sessions' => LoginSession::where('is_active', true)->count(),
            'sessions_today' => LoginSession::whereDate('created_at', today())->count(),
            'sessions_this_week' => LoginSession::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'sessions_this_month' => LoginSession::whereMonth('created_at', now()->month)->count(),
            'top_users' => LoginSession::select('user_id', DB::raw('count(*) as count'))
                ->with('user:id,christian_name,family_name')
                ->groupBy('user_id')
                ->orderBy('count', 'desc')
                ->limit(5)
                ->get(),
            'average_session_duration' => LoginSession::whereNotNull('logout_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, created_at, logout_at)) as avg_duration')
                ->first()->avg_duration ?? 0,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function userSummary(int $userId): JsonResponse
    {
        $user = User::findOrFail($userId);
        
        $summary = [
            'user' => [
                'id' => $user->id,
                'name' => $user->christian_name . ' ' . $user->family_name,
                'role' => $user->role,
            ],
            'total_sessions' => LoginSession::where('user_id', $userId)->count(),
            'active_sessions' => LoginSession::where('user_id', $userId)->where('is_active', true)->count(),
            'sessions_today' => LoginSession::where('user_id', $userId)->whereDate('created_at', today())->count(),
            'sessions_this_week' => LoginSession::where('user_id', $userId)->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'recent_sessions' => LoginSession::where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
            'average_session_duration' => LoginSession::where('user_id', $userId)
                ->whereNotNull('logout_at')
                ->selectRaw('AVG(TIMESTAMPDIFF(MINUTE, created_at, logout_at)) as avg_duration')
                ->first()->avg_duration ?? 0,
        ];

        return response()->json([
            'success' => true,
            'data' => $summary
        ]);
    }

    public function forceLogout(string $sessionId): JsonResponse
    {
        $session = LoginSession::where('session_id', $sessionId)->first();

        if (!$session) {
            return response()->json([
                'success' => false,
                'message' => 'Session not found'
            ], 404);
        }

        $session->update([
            'is_active' => false,
            'logout_at' => now(),
            'forced_logout' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Session force logged out successfully',
            'data' => [
                'session_id' => $sessionId,
                'user_id' => $session->user_id,
                'logout_at' => $session->logout_at,
            ]
        ]);
    }

    public function clearOldSessions(Request $request): JsonResponse
    {
        $days = $request->get('days', 30);
        $deleted = LoginSession::where('created_at', '<', now()->subDays($days))->delete();

        return response()->json([
            'success' => true,
            'message' => "Deleted {$deleted} old login sessions",
            'deleted_count' => $deleted
        ]);
    }
} 