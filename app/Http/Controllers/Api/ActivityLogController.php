<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ActivityLog::with('user')
            ->orderBy('created_at', 'desc');

        // Filter by user if provided
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by action if provided
        if ($request->has('action')) {
            $query->where('action', $request->action);
        }

        // Filter by date range if provided
        if ($request->has('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $logs = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'pagination' => [
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ]
        ]);
    }

    public function statistics(): JsonResponse
    {
        $stats = [
            'total_logs' => ActivityLog::count(),
            'logs_today' => ActivityLog::whereDate('created_at', today())->count(),
            'logs_this_week' => ActivityLog::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'logs_this_month' => ActivityLog::whereMonth('created_at', now()->month)->count(),
            'top_actions' => ActivityLog::select('action', DB::raw('count(*) as count'))
                ->groupBy('action')
                ->orderBy('count', 'desc')
                ->limit(5)
                ->get(),
            'top_users' => ActivityLog::select('user_id', DB::raw('count(*) as count'))
                ->with('user:id,christian_name,family_name')
                ->groupBy('user_id')
                ->orderBy('count', 'desc')
                ->limit(5)
                ->get(),
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
            'total_activities' => ActivityLog::where('user_id', $userId)->count(),
            'activities_today' => ActivityLog::where('user_id', $userId)->whereDate('created_at', today())->count(),
            'activities_this_week' => ActivityLog::where('user_id', $userId)->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'recent_activities' => ActivityLog::where('user_id', $userId)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
            'action_breakdown' => ActivityLog::where('user_id', $userId)
                ->select('action', DB::raw('count(*) as count'))
                ->groupBy('action')
                ->orderBy('count', 'desc')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $summary
        ]);
    }

    public function clearOldLogs(Request $request): JsonResponse
    {
        $days = $request->get('days', 30);
        $deleted = ActivityLog::where('created_at', '<', now()->subDays($days))->delete();

        return response()->json([
            'success' => true,
            'message' => "Deleted {$deleted} old activity logs",
            'deleted_count' => $deleted
        ]);
    }
} 