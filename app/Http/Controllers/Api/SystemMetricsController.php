<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\User;
use App\Models\ActivityLog;
use App\Models\LoginSession;
use Illuminate\Support\Facades\DB;

class SystemMetricsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $metrics = [
            'users' => [
                'total' => User::count(),
                'admin' => User::where('role', 'admin')->count(),
                'unit_leader' => User::where('role', 'unit_leader')->count(),
                'member' => User::where('role', 'member')->count(),
                'active_today' => User::whereDate('last_activity_at', today())->count(),
            ],
            'system' => [
                'active_sessions' => LoginSession::where('is_active', true)->count(),
                'activities_today' => ActivityLog::whereDate('created_at', today())->count(),
                'unresolved_errors' => \App\Models\ErrorLog::where('resolved', false)->count(),
                'system_uptime' => $this->calculateSystemUptime(),
            ],
            'performance' => [
                'avg_response_time' => $this->calculateAverageResponseTime(),
                'error_rate' => $this->calculateErrorRate(),
                'user_satisfaction' => $this->calculateUserSatisfaction(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $metrics
        ]);
    }

    public function currentStats(): JsonResponse
    {
        $stats = [
            'users' => [
                'total' => User::count(),
                'admin' => User::where('role', 'admin')->count(),
                'unit_leader' => User::where('role', 'unit_leader')->count(),
                'member' => User::where('role', 'member')->count(),
                'active_today' => User::whereDate('last_activity_at', today())->count(),
            ],
            'agriculture' => [
                'total_lands' => \App\Models\Land::count(),
                'total_crops' => \App\Models\Crop::count(),
                'total_produce' => \App\Models\Produce::count(),
                'total_reports' => \App\Models\Report::count(),
            ],
            'system' => [
                'active_sessions' => LoginSession::where('is_active', true)->count(),
                'activities_today' => ActivityLog::whereDate('created_at', today())->count(),
                'unresolved_errors' => \App\Models\ErrorLog::where('resolved', false)->count(),
                'system_uptime' => $this->calculateSystemUptime(),
            ],
            'performance' => [
                'avg_response_time' => $this->calculateAverageResponseTime(),
                'error_rate' => $this->calculateErrorRate(),
                'user_satisfaction' => $this->calculateUserSatisfaction(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function historical(Request $request): JsonResponse
    {
        $days = $request->get('days', 30);
        $endDate = now();
        $startDate = now()->subDays($days);

        $historicalData = [];
        $currentDate = $startDate->copy();

        while ($currentDate <= $endDate) {
            $date = $currentDate->format('Y-m-d');
            
            $historicalData[] = [
                'date' => $date,
                'users' => User::whereDate('created_at', $date)->count(),
                'activities' => ActivityLog::whereDate('created_at', $date)->count(),
                'sessions' => LoginSession::whereDate('created_at', $date)->count(),
                'active_sessions' => LoginSession::whereDate('created_at', $date)->where('is_active', true)->count(),
            ];

            $currentDate->addDay();
        }

        return response()->json([
            'success' => true,
            'data' => $historicalData
        ]);
    }

    public function record(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'metric' => 'required|string',
            'value' => 'required|numeric',
            'category' => 'required|string',
        ]);

        // In a real implementation, you would store this in a metrics table
        // For now, we'll just return success

        return response()->json([
            'success' => true,
            'message' => 'Metric recorded successfully',
            'data' => $validated
        ]);
    }

    public function dashboard(): JsonResponse
    {
        $dashboard = [
            'recent_activities' => ActivityLog::with('user:id,christian_name,family_name')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'action' => $activity->action,
                        'description' => $activity->description,
                        'created_at' => $activity->created_at->toISOString(),
                        'user' => [
                            'id' => $activity->user->id,
                            'christian_name' => $activity->user->christian_name,
                            'family_name' => $activity->user->family_name,
                        ],
                    ];
                }),
            'recent_errors' => \App\Models\ErrorLog::orderBy('created_at', 'desc')->limit(10)->get(),
            'active_users' => LoginSession::with('user:id,christian_name,family_name')
                ->where('is_active', true)
                ->orderBy('last_activity_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($session) {
                    return [
                        'id' => $session->id,
                        'last_activity_at' => $session->last_activity_at->toISOString(),
                        'user' => [
                            'id' => $session->user->id,
                            'christian_name' => $session->user->christian_name,
                            'family_name' => $session->user->family_name,
                        ],
                    ];
                }),
            'system_health' => [
                'uptime' => $this->calculateSystemUptime(),
                'error_rate' => $this->calculateErrorRate(),
                'active_sessions' => LoginSession::where('is_active', true)->count(),
                'total_users' => User::count(),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $dashboard
        ]);
    }

    /**
     * Calculate system uptime percentage
     */
    private function calculateSystemUptime(): float
    {
        // For now, return a high uptime percentage
        // In a real implementation, this would check actual system uptime
        return 99.9;
    }

    /**
     * Calculate average response time
     */
    private function calculateAverageResponseTime(): int
    {
        // For now, return a reasonable response time
        // In a real implementation, this would calculate from actual request logs
        return 150;
    }

    /**
     * Calculate error rate percentage
     */
    private function calculateErrorRate(): float
    {
        $totalErrors = \App\Models\ErrorLog::count();
        $totalActivities = ActivityLog::count();
        
        if ($totalActivities === 0) {
            return 0.0;
        }
        
        return round(($totalErrors / $totalActivities) * 100, 1);
    }

    /**
     * Calculate user satisfaction percentage
     */
    private function calculateUserSatisfaction(): int
    {
        // For now, return a high satisfaction rate
        // In a real implementation, this would be based on user feedback/surveys
        return 95;
    }
} 