<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Land;
use App\Models\Crop;
use App\Models\Produce;
use App\Models\MemberFee;
use App\Models\Report;
use App\Models\ActivityLog;

class MemberController extends Controller
{
    /**
     * Get member dashboard statistics
     */
    public function getDashboardStats(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'member') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Member privileges required.'
                ], 403);
            }

            // Get assigned land area
            $assignedLand = Land::where('user_id', $user->id)->sum('area');

            // Get active crops count
            $activeCrops = Crop::whereHas('land', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->where('status', 'active')->count();

            // Get monthly produce
            $monthlyProduce = Produce::whereHas('crop.land', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->whereMonth('created_at', now()->month)
              ->whereYear('created_at', now()->year)
              ->sum('quantity');

            // Get this month's fees
            $thisMonthFees = MemberFee::where('user_id', $user->id)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->where('status', 'paid')
                ->sum('amount');

            // Get pending reports
            $pendingReports = Report::where('user_id', $user->id)
                ->where('status', 'pending')
                ->count();

            // Mock upcoming tasks count
            $upcomingTasks = 3; // Mock data

            return response()->json([
                'success' => true,
                'data' => [
                    'assignedLand' => $assignedLand,
                    'activeCrops' => $activeCrops,
                    'monthlyProduce' => $monthlyProduce,
                    'thisMonthFees' => $thisMonthFees,
                    'pendingReports' => $pendingReports,
                    'upcomingTasks' => $upcomingTasks,
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
     * Get member recent activities
     */
    public function getRecentActivities(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'member') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Member privileges required.'
                ], 403);
            }

            // Get recent activities for this member
            $activities = ActivityLog::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'action' => $activity->description,
                        'time' => $activity->created_at->diffForHumans(),
                        'type' => $activity->action,
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
     * Get member upcoming fees
     */
    public function getUpcomingFees(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'member') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Member privileges required.'
                ], 403);
            }

            // Get upcoming fees for this member
            $fees = MemberFee::where('user_id', $user->id)
                ->where('status', '!=', 'paid')
                ->with('feeRule')
                ->orderBy('created_at', 'asc')
                ->limit(5)
                ->get()
                ->map(function ($fee) {
                    return [
                        'id' => $fee->id,
                        'title' => $fee->feeRule ? $fee->feeRule->name : 'Fee',
                        'dueDate' => $fee->created_at->addDays(30)->format('Y-m-d'), // Mock due date
                        'amount' => $fee->amount,
                        'status' => $fee->status,
                        'fee_rule' => $fee->feeRule ? [
                            'name' => $fee->feeRule->name,
                            'type' => $fee->feeRule->type,
                        ] : null,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $fees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch upcoming fees: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get member's land data
     */
    public function getLand(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'member') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Member privileges required.'
                ], 403);
            }

            $lands = Land::where('user_id', $user->id)
                ->with(['unit', 'zone'])
                ->get()
                ->map(function ($land) {
                    return [
                        'id' => $land->id,
                        'land_number' => $land->land_number,
                        'area' => $land->area,
                        'zone' => $land->zone ? $land->zone->name : 'Unknown',
                        'unit_id' => $land->unit_id,
                        'unit' => $land->unit ? $land->unit->name : 'Unknown',
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $lands
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch land data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get member's crops data
     */
    public function getCrops(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'member') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Member privileges required.'
                ], 403);
            }

            $crops = Crop::whereHas('land', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->with(['land'])
            ->get()
            ->map(function ($crop) {
                return [
                    'id' => $crop->id,
                    'name' => $crop->name,
                    'variety' => $crop->variety,
                    'status' => $crop->status,
                    'land_id' => $crop->land_id,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $crops
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch crops data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get member's produce data
     */
    public function getProduce(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'member') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Member privileges required.'
                ], 403);
            }

            $produce = Produce::whereHas('crop.land', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->with(['crop.land'])
            ->get()
            ->map(function ($produce) {
                return [
                    'id' => $produce->id,
                    'crop_id' => $produce->crop_id,
                    'quantity' => $produce->quantity,
                    'unit_of_measure' => $produce->unit_of_measure,
                    'harvest_date' => $produce->harvest_date,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $produce
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch produce data: ' . $e->getMessage()
            ], 500);
        }
    }
} 