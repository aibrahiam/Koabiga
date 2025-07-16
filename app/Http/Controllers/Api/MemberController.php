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

            // Get assigned land area with safe fallback
            $assignedLand = Land::where('user_id', $user->id)->sum('area') ?? 0;

            // Get active crops count (crops table doesn't have status column)
            $activeCrops = Crop::whereHas('land', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->count() ?? 0;

            // Get monthly produce with safe fallback
            $monthlyProduce = Produce::whereHas('crop.land', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->whereMonth('created_at', now()->month)
              ->whereYear('created_at', now()->year)
              ->sum('quantity') ?? 0;

            // Get this month's fees with safe fallback
            $thisMonthFees = MemberFee::where('user_id', $user->id)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->where('status', 'paid')
                ->sum('amount') ?? 0;

            // Get pending reports with safe fallback
            $pendingReports = Report::where('user_id', $user->id)
                ->where('status', 'pending')
                ->count() ?? 0;

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

            // Get recent activities for this member with safe fallback
            $activities = ActivityLog::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get()
                ->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'action' => $activity->description ?? 'Activity',
                        'time' => $activity->created_at->diffForHumans(),
                        'type' => $activity->action ?? 'general',
                    ];
                }) ?? [];

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

            // Get upcoming fees for this member with safe fallback
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
                        'amount' => $fee->amount ?? 0,
                        'status' => $fee->status ?? 'pending',
                        'fee_rule' => $fee->feeRule ? [
                            'name' => $fee->feeRule->name ?? 'Unknown',
                            'type' => $fee->feeRule->type ?? 'general',
                        ] : null,
                    ];
                }) ?? [];

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
                        'land_number' => $land->land_number ?? 'Unknown',
                        'area' => $land->area ?? 0,
                        'zone' => $land->zone ? $land->zone->name : 'Unknown',
                        'unit_id' => $land->unit_id,
                        'unit' => $land->unit ? $land->unit->name : 'Unknown',
                    ];
                }) ?? [];

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
                    'name' => $crop->name ?? 'Unknown Crop',
                    'variety' => $crop->variety ?? 'Unknown',
                    'status' => 'active', // Default since crops table doesn't have status
                    'land_id' => $crop->land_id,
                ];
            }) ?? [];

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
                    'quantity' => $produce->quantity ?? 0,
                    'unit_of_measure' => $produce->unit_of_measure ?? 'kg',
                    'harvest_date' => $produce->harvest_date,
                ];
            }) ?? [];

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

    /**
     * Get member's forms data
     */
    public function getForms(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'member') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Member privileges required.'
                ], 403);
            }

            // Mock data for forms - in a real implementation, this would query the forms table
            $forms = [
                [
                    'id' => 1,
                    'title' => 'Monthly Crop Report',
                    'description' => 'Report on crop status and progress',
                    'status' => 'pending',
                    'dueDate' => '2024-01-15',
                    'type' => 'monthly',
                ],
                [
                    'id' => 2,
                    'title' => 'Harvest Report',
                    'description' => 'Report on harvest quantities and quality',
                    'status' => 'completed',
                    'dueDate' => '2024-01-10',
                    'type' => 'harvest',
                ],
                [
                    'id' => 3,
                    'title' => 'Land Management Report',
                    'description' => 'Report on land maintenance and improvements',
                    'status' => 'overdue',
                    'dueDate' => '2024-01-05',
                    'type' => 'land',
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $forms
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch forms data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get member's reports data
     */
    public function getReports(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'member') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Member privileges required.'
                ], 403);
            }

            // Get reports for this member with safe fallback
            $reports = Report::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($report) {
                    return [
                        'id' => $report->id,
                        'title' => $report->title ?? 'Report',
                        'description' => $report->description ?? 'No description',
                        'status' => $report->status ?? 'pending',
                        'created_at' => $report->created_at->format('Y-m-d H:i:s'),
                        'updated_at' => $report->updated_at->format('Y-m-d H:i:s'),
                    ];
                }) ?? [];

            return response()->json([
                'success' => true,
                'data' => $reports
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reports data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get member's fees data
     */
    public function getFees(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'member') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Member privileges required.'
                ], 403);
            }

            // Get fees for this member with safe fallback
            $fees = MemberFee::where('user_id', $user->id)
                ->with('feeRule')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($fee) {
                    return [
                        'id' => $fee->id,
                        'title' => $fee->feeRule ? $fee->feeRule->name : 'Fee',
                        'description' => $fee->feeRule ? $fee->feeRule->description : 'No description',
                        'amount' => $fee->amount ?? 0,
                        'status' => $fee->status ?? 'pending',
                        'dueDate' => $fee->created_at->addDays(30)->format('Y-m-d'), // Mock due date
                        'created_at' => $fee->created_at->format('Y-m-d H:i:s'),
                        'fee_rule' => $fee->feeRule ? [
                            'name' => $fee->feeRule->name ?? 'Unknown',
                            'type' => $fee->feeRule->type ?? 'general',
                        ] : null,
                    ];
                }) ?? [];

            return response()->json([
                'success' => true,
                'data' => $fees
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch fees data: ' . $e->getMessage()
            ], 500);
        }
    }
} 