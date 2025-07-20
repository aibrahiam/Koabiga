<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Land;
use App\Models\Crop;
use App\Models\Produce;

use App\Models\Report;
use App\Models\ActivityLog;
use App\Models\Unit;
use App\Models\FeeApplication;
use App\Models\Form;
use App\Models\Task;

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

            // Get this month's fees with safe fallback (all fees, not just paid)
            $thisMonthFees = FeeApplication::where('user_id', $user->id)
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('amount') ?? 0;

            // Get pending reports with safe fallback
            $pendingReports = Report::where('user_id', $user->id)
                ->where('status', 'pending')
                ->count() ?? 0;

            // Get actual upcoming tasks count from tasks table
            $upcomingTasks = Task::where('assigned_to', $user->id)
                ->upcoming()
                ->count();

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
            $fees = FeeApplication::where('user_id', $user->id)
                ->where('status', '!=', 'paid')
                ->with('feeRule')
                ->orderBy('created_at', 'asc')
                ->limit(5)
                ->get()
                ->map(function ($fee) {
                    return [
                        'id' => $fee->id,
                        'title' => $fee->feeRule ? $fee->feeRule->name : 'Fee',
                        'dueDate' => Carbon::parse($fee->created_at)->addDays(30)->format('Y-m-d'), // Mock due date
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
                // Determine status based on planting and harvest dates
                $status = 'active';
                if ($crop->planting_date && $crop->expected_harvest_date) {
                    $now = now();
                    if ($now < $crop->planting_date) {
                        $status = 'planned';
                    } elseif ($now > $crop->expected_harvest_date) {
                        $status = 'harvested';
                    } else {
                        $status = 'growing';
                    }
                }
                
                return [
                    'id' => $crop->id,
                    'name' => $crop->name ?? 'Unknown Crop',
                    'variety' => $crop->variety ?? 'Unknown',
                    'status' => $status,
                    'land_id' => $crop->land_id,
                    'land' => $crop->land ? [
                        'land_number' => $crop->land->land_number ?? 'Unknown',
                        'area' => $crop->land->area ?? 0,
                    ] : null,
                    'planting_date' => $crop->planting_date,
                    'expected_harvest_date' => $crop->expected_harvest_date,
                    'area_planted' => $crop->area_planted,
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
            })->with(['crop'])
            ->get()
            ->map(function ($produce) {
                return [
                    'id' => $produce->id,
                    'crop_id' => $produce->crop_id,
                    'quantity' => $produce->quantity ?? 0,
                    'unit_of_measure' => $produce->unit_of_measure ?? 'kg',
                    'harvest_date' => $produce->harvest_date,
                    'crop' => $produce->crop ? [
                        'name' => $produce->crop->name ?? 'Unknown Crop',
                        'variety' => $produce->crop->variety ?? 'Unknown',
                    ] : null,
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

            // Get forms assigned to this member or their unit
            $forms = Form::where(function ($query) use ($user) {
                // Forms assigned directly to the user
                $query->where('assigned_to', $user->id)
                    // Or forms assigned to the user's unit
                    ->orWhere('unit_id', $user->unit_id)
                    // Or forms with target roles that include 'member'
                    ->orWhereJsonContains('target_roles', 'member');
            })
            ->with(['submissions' => function ($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($form) use ($user) {
                // Get the user's submission for this form
                $submission = $form->submissions->first();
                
                // Determine status based on submission
                $status = 'pending';
                $dueDate = $form->due_date ? $form->due_date->format('Y-m-d') : null;
                
                if ($submission) {
                    $status = $submission->status;
                } elseif ($form->due_date && $form->due_date->isPast()) {
                    $status = 'overdue';
                }
                
                return [
                    'id' => $form->id,
                    'title' => $form->title,
                    'description' => $form->description ?? 'No description available',
                    'status' => $status,
                    'dueDate' => $dueDate,
                    'type' => $form->type ?? 'general',
                    'category' => $form->category ?? 'other',
                    'submitted_at' => $submission ? $submission->submitted_at : null,
                    'submission_id' => $submission ? $submission->id : null,
                ];
            });

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
     * Get member's unit information
     */
    public function getUnit(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'member') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Member privileges required.'
                ], 403);
            }

            $unit = null;
            
            // First try to get unit from user's unit_id
            if ($user->unit_id) {
                $unit = Unit::find($user->unit_id);
            }
            
            // If no unit found, try to get from land assignment
            if (!$unit) {
                $land = Land::where('user_id', $user->id)->with('unit')->first();
                if ($land && $land->unit) {
                    $unit = $land->unit;
                }
            }

            if (!$unit) {
                return response()->json([
                    'success' => true,
                    'data' => null,
                    'message' => 'No unit assigned'
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $unit->id,
                    'name' => $unit->name,
                    'code' => $unit->code,
                    'description' => $unit->description,
                    'leader' => $unit->leader ? [
                        'id' => $unit->leader->id,
                        'name' => $unit->leader->christian_name . ' ' . $unit->leader->family_name,
                        'phone' => $unit->leader->phone,
                    ] : null,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch unit information: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get member's fee rules and applications
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

            // Get fee applications for this member
            $feeApplications = FeeApplication::where('user_id', $user->id)
                ->with(['feeRule'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($application) {
                    return [
                        'id' => $application->id,
                        'fee_rule' => [
                            'id' => $application->feeRule->id,
                            'name' => $application->feeRule->name,
                            'type' => $application->feeRule->type,
                            'description' => $application->feeRule->description,
                        ],
                        'amount' => $application->amount,
                        'due_date' => $application->due_date,
                        'status' => $application->status,
                        'created_at' => $application->created_at,
                        'paid_date' => $application->paid_date,
                        'notes' => $application->notes,
                    ];
                });

            // Calculate statistics
            $stats = [
                'total_fees' => $feeApplications->count(),
                'paid_fees' => $feeApplications->where('status', 'paid')->count(),
                'pending_fees' => $feeApplications->where('status', 'pending')->count(),
                'overdue_fees' => $feeApplications->where('status', 'overdue')->count(),
                'total_amount' => $feeApplications->sum('amount'),
                'paid_amount' => $feeApplications->where('status', 'paid')->sum('amount'),
                'pending_amount' => $feeApplications->where('status', 'pending')->sum('amount'),
                'overdue_amount' => $feeApplications->where('status', 'overdue')->sum('amount'),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'fee_applications' => $feeApplications,
                    'stats' => $stats
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch fees data: ' . $e->getMessage()
            ], 500);
        }
    }

    // Admin CRUD Methods
    public function index(Request $request): JsonResponse
    {
        try {
            $query = User::where('role', 'member')
                ->with(['unit', 'zone'])
                ->orderBy('created_at', 'desc');

            // Filter by status
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            // Filter by unit
            if ($request->has('unit_id') && $request->unit_id) {
                $query->where('unit_id', $request->unit_id);
            }

            // Filter by zone
            if ($request->has('zone_id') && $request->zone_id) {
                $query->whereHas('unit', function ($q) use ($request) {
                    $q->where('zone_id', $request->zone_id);
                });
            }

            // Search
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('christian_name', 'like', "%{$search}%")
                      ->orWhere('family_name', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%")
                      ->orWhere('national_id', 'like', "%{$search}%");
                });
            }

            $members = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $members->items(),
                'pagination' => [
                    'current_page' => $members->currentPage(),
                    'last_page' => $members->lastPage(),
                    'per_page' => $members->perPage(),
                    'total' => $members->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch members: ' . $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'christian_name' => 'required|string|max:255',
                'family_name' => 'required|string|max:255',
                'phone' => 'required|string|max:20|unique:users,phone',
                'secondary_phone' => 'nullable|string|max:20',
                'national_id' => 'required|string|max:50|unique:users,national_id',
                'gender' => 'required|in:male,female',
                'unit_id' => 'nullable|exists:units,id',
                'zone_id' => 'nullable|exists:zones,id',
                'status' => 'required|in:active,inactive',
            ]);

            $validated['role'] = 'member';
            $validated['password'] = bcrypt('password123'); // Default password
            $validated['pin'] = '1234'; // Default PIN

            $member = User::create($validated);

            return response()->json([
                'success' => true,
                'message' => 'Member created successfully',
                'data' => $member->load(['unit', 'zone'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create member: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $member = User::where('id', $id)
                ->where('role', 'member')
                ->with(['unit', 'zone'])
                ->first();

            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => 'Member not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $member
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch member: ' . $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $member = User::where('id', $id)
                ->where('role', 'member')
                ->first();

            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => 'Member not found'
                ], 404);
            }

            $validated = $request->validate([
                'christian_name' => 'required|string|max:255',
                'family_name' => 'required|string|max:255',
                'phone' => 'required|string|max:20|unique:users,phone,' . $id,
                'secondary_phone' => 'nullable|string|max:20',
                'national_id' => 'required|string|max:50|unique:users,national_id,' . $id,
                'gender' => 'required|in:male,female',
                'unit_id' => 'nullable|exists:units,id',
                'zone_id' => 'nullable|exists:zones,id',
                'status' => 'required|in:active,inactive',
            ]);

            $member->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Member updated successfully',
                'data' => $member->load(['unit', 'zone'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update member: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $member = User::where('id', $id)
                ->where('role', 'member')
                ->first();

            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => 'Member not found'
                ], 404);
            }

            // Check if member has any associated data
            if ($member->lands()->count() > 0 || $member->crops()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete member with associated data'
                ], 400);
            }

            $member->delete();

            return response()->json([
                'success' => true,
                'message' => 'Member deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete member: ' . $e->getMessage()
            ], 500);
        }
    }

    public function import(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'file' => 'required|file|mimes:csv,xlsx,xls',
            ]);

            // Import logic would go here
            return response()->json([
                'success' => true,
                'message' => 'Import functionality to be implemented'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to import members: ' . $e->getMessage()
            ], 500);
        }
    }

    public function export(): JsonResponse
    {
        try {
            $members = User::where('role', 'member')
                ->with(['unit', 'zone'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $members,
                'message' => 'Export data ready'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export members: ' . $e->getMessage()
            ], 500);
        }
    }
} 