<?php

namespace App\Http\Controllers\Api\Member;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Land;
use App\Models\Crop;
use App\Models\Produce;
use App\Models\Report;
use App\Models\FeeApplication;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    /**
     * Get member dashboard statistics
     */
    public function stats(): JsonResponse
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

            // Get active crops
            $activeCrops = Crop::where('user_id', $user->id)
                ->whereIn('status', ['planted', 'growing'])
                ->count();

            // Get monthly produce
            $currentMonth = now()->month;
            $currentYear = now()->year;
            $monthlyProduce = Produce::where('user_id', $user->id)
                ->whereMonth('harvest_date', $currentMonth)
                ->whereYear('harvest_date', $currentYear)
                ->sum('quantity');

            // Get this month's fees paid
            $thisMonthFees = FeeApplication::where('user_id', $user->id)
                ->whereNotNull('paid_date')
                ->whereMonth('paid_date', $currentMonth)
                ->whereYear('paid_date', $currentYear)
                ->sum('amount');

            // Get pending reports
            $pendingReports = Report::where('user_id', $user->id)
                ->where('status', 'draft')
                ->count();

            // Mock upcoming tasks (in a real app, this would come from a tasks table)
            $upcomingTasks = 3;

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
            Log::error('Dashboard stats error: ' . $e->getMessage(), [
                'user_id' => $user->id ?? null,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Unable to load dashboard statistics. Please try again later.'
            ], 500);
        }
    }

    /**
     * Get member recent activities
     */
    public function activities(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'member') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Member privileges required.'
                ], 403);
            }

            $activities = [];

            // Get recent crop activities
            $recentCrops = Crop::where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->limit(3)
                ->get();

            foreach ($recentCrops as $crop) {
                $activities[] = [
                    'id' => $crop->id,
                    'action' => "Crop {$crop->status}",
                    'crop' => $crop->crop_name,
                    'time' => $crop->created_at->format('Y-m-d'),
                    'type' => 'crop'
                ];
            }

            // Get recent produce activities
            $recentProduce = Produce::where('user_id', $user->id)
                ->orderBy('harvest_date', 'desc')
                ->limit(2)
                ->get();

            foreach ($recentProduce as $produce) {
                $activities[] = [
                    'id' => $produce->id,
                    'action' => 'Harvest completed',
                    'crop' => $produce->name ?? 'Crop',
                    'time' => $produce->harvest_date,
                    'type' => 'harvest'
                ];
            }

            // Get recent land activities
            $recentLands = Land::where('user_id', $user->id)
                ->orderBy('updated_at', 'desc')
                ->limit(1)
                ->get();

            foreach ($recentLands as $land) {
                $activities[] = [
                    'id' => $land->id,
                    'action' => 'Land maintenance',
                    'area' => $land->land_number,
                    'time' => $land->updated_at->format('Y-m-d'),
                    'type' => 'maintenance'
                ];
            }

            // Sort by time and limit to 5 most recent
            usort($activities, function ($a, $b) {
                return strtotime($b['time']) - strtotime($a['time']);
            });

            return response()->json([
                'success' => true,
                'data' => array_slice($activities, 0, 5)
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard activities error: ' . $e->getMessage(), [
                'user_id' => $user->id ?? null,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Unable to load recent activities. Please try again later.'
            ], 500);
        }
    }

    /**
     * Get member upcoming fees
     */
    public function upcomingFees(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'member') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Member privileges required.'
                ], 403);
            }

            $upcomingFees = FeeApplication::where('user_id', $user->id)
                ->whereIn('status', ['pending', 'overdue'])
                ->with('feeRule')
                ->orderBy('due_date', 'asc')
                ->limit(5)
                ->get()
                ->map(function ($fee) {
                    return [
                        'id' => $fee->id,
                        'title' => $fee->feeRule->name,
                        'dueDate' => $fee->due_date,
                        'amount' => $fee->amount,
                        'status' => $fee->status === 'overdue' ? 'Overdue' : 'Pending',
                        'fee_rule' => [
                            'name' => $fee->feeRule->name,
                            'type' => $fee->feeRule->type
                        ]
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $upcomingFees
            ]);
        } catch (\Exception $e) {
            Log::error('Dashboard upcoming fees error: ' . $e->getMessage(), [
                'user_id' => $user->id ?? null,
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Unable to load upcoming fees. Please try again later.'
            ], 500);
        }
    }
} 