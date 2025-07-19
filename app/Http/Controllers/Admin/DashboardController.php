<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Zone;
use App\Models\User;
use App\Models\Unit;
use App\Models\Land;
use App\Models\Crop;
use App\Models\Produce;
use App\Models\Report;
use App\Models\ActivityLog;
use App\Models\ErrorLog;
use App\Models\LoginSession;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // Get user statistics
        $users = User::all();
        $adminCount = $users->where('role', 'admin')->count();
        $leaderCount = $users->where('role', 'unit_leader')->count();
        $memberCount = $users->where('role', 'member')->count();

        // Get zone statistics
        $zoneStats = [
            'total_zones' => Zone::count(),
            'active_zones' => Zone::where('status', 'active')->count(),
            'inactive_zones' => Zone::where('status', 'inactive')->count(),
            'zones_with_leaders' => Zone::whereNotNull('leader_id')->count(),
            'zones_without_leaders' => Zone::whereNull('leader_id')->count(),
        ];

        // Get agriculture statistics
        $agricultureStats = [
            'total_lands' => Land::count(),
            'total_crops' => Crop::count(),
            'total_produce' => Produce::count(),
            'total_reports' => Report::count(),
        ];

        // Get system statistics
        $systemMetrics = [
            'active_sessions' => LoginSession::where('is_active', true)->count(),
            'activities_today' => ActivityLog::whereDate('created_at', today())->count(),
            'unresolved_errors' => ErrorLog::where('resolved', false)->count(),
            'system_uptime' => 99.9, // Placeholder - should be calculated from actual metrics
        ];

        // Get performance metrics
        $performanceStats = [
            'avg_response_time' => 120, // Placeholder - should be calculated from actual metrics
            'error_rate' => 0.1, // Placeholder
            'user_satisfaction' => 95, // Placeholder
        ];

        // Get recent activities
        $recentActivities = ActivityLog::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'action' => $activity->action,
                    'description' => $activity->description,
                    'created_at' => $activity->created_at->toISOString(),
                    'user' => $activity->user ? [
                        'id' => $activity->user->id,
                        'christian_name' => $activity->user->christian_name,
                        'family_name' => $activity->user->family_name,
                    ] : null,
                ];
            });

        // Get recent errors
        $recentErrors = ErrorLog::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($error) {
                return [
                    'id' => $error->id,
                    'level' => $error->level,
                    'message' => $error->message,
                    'created_at' => $error->created_at->toISOString(),
                    'user' => $error->user ? [
                        'id' => $error->user->id,
                        'christian_name' => $error->user->christian_name,
                        'family_name' => $error->user->family_name,
                    ] : null,
                ];
            });

        // Get active users
        $activeUsers = LoginSession::with('user')
            ->where('is_active', true)
            ->latest('last_activity_at')
            ->take(5)
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'last_activity_at' => $session->last_activity_at->toISOString(),
                    'user' => $session->user ? [
                        'id' => $session->user->id,
                        'christian_name' => $session->user->christian_name,
                        'family_name' => $session->user->family_name,
                    ] : null,
                ];
            });

        // Get system health
        $systemHealth = [
            'uptime' => 99.8,
            'error_rate' => 0.2,
            'active_sessions' => $systemMetrics['active_sessions'],
            'total_users' => $users->count(),
        ];

        // Get recent reports
        $recentReports = Report::latest()
            ->take(5)
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'title' => $report->title,
                    'status' => $report->status,
                    'submitted_by' => $report->submitted_by,
                    'submitted_at' => $report->created_at->toISOString(),
                ];
            });

        // Get system alerts
        $systemAlerts = [
            [
                'id' => 1,
                'type' => 'warning',
                'message' => 'System maintenance scheduled for tomorrow',
                'created_at' => now()->toISOString(),
            ],
        ];

        $systemStats = [
            'users' => [
                'total' => $users->count(),
                'admin' => $adminCount,
                'unit_leader' => $leaderCount,
                'member' => $memberCount,
                'active_today' => LoginSession::whereDate('created_at', today())->count(),
            ],
            'agriculture' => $agricultureStats,
            'system' => $systemMetrics,
            'performance' => $performanceStats,
        ];

        $dashboardMetrics = [
            'recent_activities' => $recentActivities,
            'recent_reports' => $recentReports,
            'system_alerts' => $systemAlerts,
            'recent_errors' => $recentErrors,
            'active_users' => $activeUsers,
            'system_health' => $systemHealth,
        ];

        return Inertia::render('koabiga/admin/admin-dashboard', [
            'systemStats' => $systemStats,
            'dashboardMetrics' => $dashboardMetrics,
            'zoneStats' => $zoneStats,
        ]);
    }
} 