<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Unit;
use App\Models\Report;
use App\Models\Form;
use App\Models\Land;
use App\Models\FeeRule;
use App\Models\ActivityLog;

use App\Models\Payment;

class DashboardController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function stats(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ], 403);
            }

            // Get total members
            $totalMembers = User::where('role', 'member')->count();

            // Get total units
            $totalUnits = Unit::count();

            // Get active reports (pending or in progress)
            $activeReports = Report::whereIn('status', ['pending', 'in_progress'])->count();

            // Get pending forms
            $pendingForms = Form::where('status', 'pending')->count();

            // Calculate monthly growth (new members this month vs last month)
            $thisMonthMembers = User::where('role', 'member')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            $lastMonthMembers = User::where('role', 'member')
                ->whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->count();

            $monthlyGrowth = $lastMonthMembers > 0 
                ? (($thisMonthMembers - $lastMonthMembers) / $lastMonthMembers) * 100 
                : 0;

            // Get total land area
            $totalLandArea = Land::sum('area');

            // Get total revenue (from payments)
            $totalRevenue = Payment::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount');

            // Get active fee rules
            $activeFeeRules = FeeRule::where('status', 'active')->count();

            return response()->json([
                'success' => true,
                'data' => [
                    'totalMembers' => $totalMembers,
                    'totalUnits' => $totalUnits,
                    'activeReports' => $activeReports,
                    'pendingForms' => $pendingForms,
                    'monthlyGrowth' => round($monthlyGrowth, 1),
                    'totalLandArea' => $totalLandArea,
                    'totalRevenue' => $totalRevenue,
                    'activeFeeRules' => $activeFeeRules,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent activities
     */
    public function activities(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ], 403);
            }

            // Get recent activities
            $activities = ActivityLog::with('user')
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'action' => $activity->description ?? 'Activity performed',
                        'user' => $activity->user ? $activity->user->christian_name . ' ' . $activity->user->family_name : 'System',
                        'time' => $activity->created_at->diffForHumans(),
                        'type' => $activity->action ?? 'general',
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $activities
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent activities: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent members
     */
    public function members(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ], 403);
            }

            // Get recent members
            $members = User::where('role', 'member')
                ->with('unit')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->christian_name . ' ' . $member->family_name,
                        'phone' => $member->phone,
                        'role' => $member->role,
                        'unit' => $member->unit ? $member->unit->name : 'No Unit',
                        'status' => $member->status,
                        'joinDate' => $member->created_at->format('Y-m-d'),
                        'avatar' => null, // No avatar system implemented yet
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $members
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch recent members: ' . $e->getMessage()
            ], 500);
        }
    }
}
