<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Land;
use App\Models\Crop;
use App\Models\Produce;
use App\Models\Report;
use App\Models\ActivityLog;
use App\Models\Form;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UnitLeaderController extends Controller
{
    /**
     * Get unit leader's unit information
     */
    public function getUnit(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            // Get unit information
            $unit = $user->unit;
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $unit->id,
                    'name' => $unit->name,
                    'code' => $unit->code,
                    'description' => $unit->description,
                    'status' => $unit->status,
                    'zone' => $unit->zone ? [
                        'id' => $unit->zone->id,
                        'name' => $unit->zone->name,
                        'code' => $unit->zone->code
                    ] : null
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve unit information.'
            ], 500);
        }
    }

    /**
     * Get unit leader dashboard statistics
     */
    public function stats(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            // Get unit information
            $unit = $user->unit;
            
            // If no unit assigned, return empty stats with a message
            if (!$unit) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'totalMembers' => 0,
                        'activeMembers' => 0,
                        'totalLandArea' => 0,
                        'activeCrops' => 0,
                        'monthlyProduce' => 0,
                        'pendingReports' => 0,
                        'upcomingTasks' => 0,
                        'unitName' => 'No Unit Assigned',
                        'unitCode' => 'N/A',
                    ],
                    'message' => 'No unit assigned to this leader. Please contact an administrator.'
                ]);
            }

            // Get unit statistics
            $totalMembers = User::where('unit_id', $unit->id)
                ->where('role', 'member')
                ->count();

            $activeMembers = User::where('unit_id', $unit->id)
                ->where('role', 'member')
                ->where('status', 'active')
                ->count();

            $totalLandArea = Land::where('unit_id', $unit->id)->sum('area');

            $activeCrops = Crop::whereHas('land', function ($query) use ($unit) {
                $query->where('unit_id', $unit->id);
            })->where('status', 'active')->count();

            $monthlyProduce = Produce::whereHas('crop.land', function ($query) use ($unit) {
                $query->where('unit_id', $unit->id);
            })->whereMonth('created_at', now()->month)
              ->whereYear('created_at', now()->year)
              ->sum('quantity');

            // Fix: Get all user IDs in this unit
            $unitMemberIds = User::where('unit_id', $unit->id)->pluck('id');
            $pendingReports = Report::whereIn('user_id', $unitMemberIds)
                ->where('status', 'pending')
                ->count();

            // Mock upcoming tasks count (in a real app, this would come from a tasks table)
            $upcomingTasks = 5; // Mock data

            // Calculate completed tasks (mock data for now)
            $completedTasks = rand(50, 200); // Mock data

            return response()->json([
                'success' => true,
                'data' => [
                    'totalMembers' => $totalMembers,
                    'activeMembers' => $activeMembers,
                    'totalLandArea' => $totalLandArea,
                    'activeCrops' => $activeCrops,
                    'monthlyProduce' => $monthlyProduce,
                    'pendingReports' => $pendingReports,
                    'upcomingTasks' => $upcomingTasks,
                    'completedTasks' => $completedTasks,
                    'unitName' => $unit->name,
                    'unitCode' => $unit->code,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch unit statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get recent activities for the unit
     */
    public function activities(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            // If no unit assigned, return empty activities
            if (!$unit) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'No unit assigned to this leader.'
                ]);
            }

            // Get recent activities for unit members
            $activities = ActivityLog::whereHas('user', function ($query) use ($unit) {
                $query->where('unit_id', $unit->id);
            })
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

            return response()->json([
                'success' => true,
                'data' => $activities
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch activities: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get upcoming tasks for the unit
     */
    public function tasks(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            // Mock upcoming tasks data (in a real app, this would come from a tasks table)
            $tasks = [
                [
                    'id' => 1,
                    'title' => 'Harvest corn from Field A',
                    'dueDate' => now()->addDays(3)->format('Y-m-d'),
                    'priority' => 'high',
                    'assignedTo' => 'John Doe',
                    'type' => 'harvest'
                ],
                [
                    'id' => 2,
                    'title' => 'Plant new wheat crop',
                    'dueDate' => now()->addDays(5)->format('Y-m-d'),
                    'priority' => 'medium',
                    'assignedTo' => 'Sarah Smith',
                    'type' => 'planting'
                ],
                [
                    'id' => 3,
                    'title' => 'Submit monthly report',
                    'dueDate' => now()->addDays(1)->format('Y-m-d'),
                    'priority' => 'high',
                    'assignedTo' => 'Unit Leader',
                    'type' => 'report'
                ],
                [
                    'id' => 4,
                    'title' => 'Equipment maintenance',
                    'dueDate' => now()->addDays(7)->format('Y-m-d'),
                    'priority' => 'low',
                    'assignedTo' => 'Mike Johnson',
                    'type' => 'maintenance'
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $tasks
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch tasks: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unit members
     */
    public function members(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            // Debug logging
            Log::info('UnitLeaderController::members called', [
                'user_id' => $user ? $user->id : null,
                'user_role' => $user ? $user->role : null,
                'authenticated' => Auth::check()
            ]);
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            // If no unit assigned, return empty members list
            if (!$unit) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'No unit assigned to this leader.'
                ]);
            }

            $members = User::where('unit_id', $unit->id)
                ->where('role', 'member')
                ->with('unit')
                ->select([
                    'id',
                    'christian_name',
                    'family_name',
                    'email',
                    'phone',
                    'role',
                    'status',
                    'unit_id',
                    'created_at',
                    'last_activity_at'
                ])
                ->get()
                ->map(function ($member) {
                    // Calculate assigned land area
                    $assignedLand = Land::where('user_id', $member->id)->sum('area');
                    
                    // Mock completed tasks (in a real app, this would come from a tasks table)
                    $completedTasks = rand(10, 50);
                    
                    return [
                        'id' => $member->id,
                        'christian_name' => $member->christian_name,
                        'family_name' => $member->family_name,
                        'email' => $member->email,
                        'phone' => $member->phone,
                        'role' => $member->role,
                        'status' => $member->status,
                        'unit_id' => $member->unit_id,
                        'created_at' => $member->created_at,
                        'last_activity_at' => $member->last_activity_at,
                        'unit' => $member->unit ? [
                            'name' => $member->unit->name,
                            'code' => $member->unit->code
                        ] : null,
                        'assignedLand' => $assignedLand,
                        'completedTasks' => $completedTasks
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $members
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch members: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unit crops
     */
    public function crops(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unit not assigned to this leader.'
                ], 404);
            }

            $crops = Crop::whereHas('land', function ($query) use ($unit) {
                $query->where('unit_id', $unit->id);
            })
            ->with(['land', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

            return response()->json([
                'success' => true,
                'data' => $crops
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch crops: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unit produce
     */
    public function produce(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unit not assigned to this leader.'
                ], 404);
            }

            $produce = Produce::whereHas('crop.land', function ($query) use ($unit) {
                $query->where('unit_id', $unit->id);
            })
            ->with(['crop.land', 'user'])
            ->orderBy('created_at', 'desc')
            ->get();

            return response()->json([
                'success' => true,
                'data' => $produce
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch produce: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unit reports
     */
    public function reports(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            // If no unit assigned, return empty reports
            if (!$unit) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                    'message' => 'No unit assigned to this leader.'
                ]);
            }

            // Get reports for unit members
            $reports = Report::whereHas('user', function ($query) use ($unit) {
                $query->where('unit_id', $unit->id);
            })
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

            return response()->json([
                'success' => true,
                'data' => $reports
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reports: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new member for the unit
     */
    public function createMember(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 400);
            }

            $request->validate([
                'christian_name' => 'required|string|max:255',
                'family_name' => 'required|string|max:255',
                'phone' => 'required|string|max:20|unique:users,phone',
                'email' => 'nullable|email|unique:users,email',
                'id_passport' => 'required|string|max:50|unique:users,id_passport',
                'password' => 'required|string|min:4|max:6',
                'password_confirmation' => 'required|same:password',
                'unit_id' => 'nullable|exists:units,id'
            ]);

            $memberData = $request->all();
            $memberData['role'] = 'member';
            $memberData['unit_id'] = $memberData['unit_id'] ?? $unit->id;
            $memberData['status'] = 'active';

            $member = User::create($memberData);

            return response()->json([
                'success' => true,
                'message' => 'Member created successfully',
                'data' => $member
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create member: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a member
     */
    public function updateMember(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 400);
            }

            $member = User::where('id', $id)
                ->where('role', 'member')
                ->where('unit_id', $unit->id)
                ->first();

            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => 'Member not found or not in your unit.'
                ], 404);
            }

            $request->validate([
                'christian_name' => 'required|string|max:255',
                'family_name' => 'required|string|max:255',
                'phone' => 'required|string|max:20|unique:users,phone,' . $id,
                'email' => 'nullable|email|unique:users,email,' . $id,
                'id_passport' => 'required|string|max:50|unique:users,id_passport,' . $id,
                'status' => 'required|in:active,inactive'
            ]);

            $member->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Member updated successfully',
                'data' => $member
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update member: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a specific member
     */
    public function showMember($id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 400);
            }

            $member = User::where('id', $id)
                ->where('role', 'member')
                ->where('unit_id', $unit->id)
                ->first();

            if (!$member) {
                return response()->json([
                    'success' => false,
                    'message' => 'Member not found or not in your unit.'
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

    /**
     * Create a new land record for the unit
     */
    public function createLand(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 400);
            }

            $request->validate([
                'land_number' => 'required|string|max:255|unique:lands,land_number',
                'zone' => 'required|string|max:255',
                'area' => 'required|numeric|min:0',
                'user_id' => 'required|exists:users,id',
                'notes' => 'nullable|string'
            ]);

            $landData = $request->all();
            $landData['unit_id'] = $unit->id;
            $landData['status'] = 'assigned';

            $land = Land::create($landData);

            return response()->json([
                'success' => true,
                'message' => 'Land record created successfully',
                'data' => $land
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create land record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a land record
     */
    public function updateLand(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 400);
            }

            $land = Land::where('id', $id)
                ->where('unit_id', $unit->id)
                ->first();

            if (!$land) {
                return response()->json([
                    'success' => false,
                    'message' => 'Land record not found or not in your unit.'
                ], 404);
            }

            $request->validate([
                'land_name' => 'required|string|max:255',
                'location' => 'required|string|max:255',
                'area_hectares' => 'required|numeric|min:0',
                'soil_type' => 'required|string|max:100',
                'member_id' => 'required|exists:users,id',
                'assignment_date' => 'required|date',
                'description' => 'nullable|string',
                'status' => 'required|in:active,inactive'
            ]);

            $land->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Land record updated successfully',
                'data' => $land
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update land record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a specific land record
     */
    public function showLand($id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 400);
            }

            $land = Land::where('id', $id)
                ->where('unit_id', $unit->id)
                ->with('member')
                ->first();

            if (!$land) {
                return response()->json([
                    'success' => false,
                    'message' => 'Land record not found or not in your unit.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $land
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch land record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new crop record for the unit
     */
    public function createCrop(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 400);
            }

            $request->validate([
                'crop_name' => 'required|string|max:255',
                'crop_type' => 'required|string|max:100',
                'variety' => 'required|string|max:100',
                'land_id' => 'required|exists:lands,id',
                'planting_date' => 'required|date',
                'expected_harvest_date' => 'required|date|after:planting_date',
                'area_planted' => 'required|numeric|min:0',
                'seed_quantity' => 'required|numeric|min:0',
                'description' => 'nullable|string'
            ]);

            // Verify the land belongs to the unit
            $land = Land::where('id', $request->land_id)
                ->where('unit_id', $unit->id)
                ->first();

            if (!$land) {
                return response()->json([
                    'success' => false,
                    'message' => 'Land not found or not in your unit.'
                ], 404);
            }

            $cropData = $request->all();
            $cropData['unit_id'] = $unit->id;
            $cropData['status'] = 'active';

            $crop = Crop::create($cropData);

            return response()->json([
                'success' => true,
                'message' => 'Crop record created successfully',
                'data' => $crop
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create crop record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a crop record
     */
    public function updateCrop(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 400);
            }

            $crop = Crop::where('id', $id)
                ->where('unit_id', $unit->id)
                ->first();

            if (!$crop) {
                return response()->json([
                    'success' => false,
                    'message' => 'Crop record not found or not in your unit.'
                ], 404);
            }

            $request->validate([
                'crop_name' => 'required|string|max:255',
                'crop_type' => 'required|string|max:100',
                'variety' => 'required|string|max:100',
                'land_id' => 'required|exists:lands,id',
                'planting_date' => 'required|date',
                'expected_harvest_date' => 'required|date|after:planting_date',
                'area_planted' => 'required|numeric|min:0',
                'seed_quantity' => 'required|numeric|min:0',
                'description' => 'nullable|string',
                'status' => 'required|in:active,inactive,harvested'
            ]);

            $crop->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Crop record updated successfully',
                'data' => $crop
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update crop record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a specific crop record
     */
    public function showCrop($id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 400);
            }

            $crop = Crop::where('id', $id)
                ->where('unit_id', $unit->id)
                ->with('land')
                ->first();

            if (!$crop) {
                return response()->json([
                    'success' => false,
                    'message' => 'Crop record not found or not in your unit.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $crop
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch crop record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new produce record for the unit
     */
    public function createProduce(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 400);
            }

            $request->validate([
                'produce_name' => 'required|string|max:255',
                'crop_id' => 'required|exists:crops,id',
                'harvest_date' => 'required|date',
                'quantity_harvested' => 'required|numeric|min:0',
                'unit_of_measure' => 'required|string|max:50',
                'quality_grade' => 'required|string|max:50',
                'market_price' => 'required|numeric|min:0',
                'total_value' => 'required|numeric|min:0',
                'description' => 'nullable|string'
            ]);

            // Verify the crop belongs to the unit
            $crop = Crop::where('id', $request->crop_id)
                ->where('unit_id', $unit->id)
                ->first();

            if (!$crop) {
                return response()->json([
                    'success' => false,
                    'message' => 'Crop not found or not in your unit.'
                ], 404);
            }

            $produceData = $request->all();
            $produceData['unit_id'] = $unit->id;
            $produceData['status'] = 'active';

            $produce = Produce::create($produceData);

            return response()->json([
                'success' => true,
                'message' => 'Produce record created successfully',
                'data' => $produce
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create produce record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a produce record
     */
    public function updateProduce(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 400);
            }

            $produce = Produce::where('id', $id)
                ->where('unit_id', $unit->id)
                ->first();

            if (!$produce) {
                return response()->json([
                    'success' => false,
                    'message' => 'Produce record not found or not in your unit.'
                ], 404);
            }

            $request->validate([
                'produce_name' => 'required|string|max:255',
                'crop_id' => 'required|exists:crops,id',
                'harvest_date' => 'required|date',
                'quantity_harvested' => 'required|numeric|min:0',
                'unit_of_measure' => 'required|string|max:50',
                'quality_grade' => 'required|string|max:50',
                'market_price' => 'required|numeric|min:0',
                'total_value' => 'required|numeric|min:0',
                'description' => 'nullable|string',
                'status' => 'required|in:active,inactive,sold'
            ]);

            $produce->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Produce record updated successfully',
                'data' => $produce
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update produce record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Show a specific produce record
     */
    public function showProduce($id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 400);
            }

            $produce = Produce::where('id', $id)
                ->where('unit_id', $unit->id)
                ->with('crop')
                ->first();

            if (!$produce) {
                return response()->json([
                    'success' => false,
                    'message' => 'Produce record not found or not in your unit.'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $produce
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch produce record: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get lands for the unit leader's unit
     */
    public function getLands(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 404);
            }

            $lands = Land::where('unit_id', $unit->id)
                ->with(['user:id,christian_name,family_name,phone'])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $lands
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve lands.'
            ], 500);
        }
    }

    /**
     * Get crops for the unit leader's unit
     */
    public function getCrops(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 404);
            }

            $query = Crop::where('unit_id', $unit->id)
                ->with(['land:id,land_name,location,area_hectares']);

            // Apply status filter if provided
            if ($request->has('status')) {
                $query->where('status', $request->get('status'));
            }

            $crops = $query->get();

            return response()->json([
                'success' => true,
                'data' => $crops
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve crops.'
            ], 500);
        }
    }

    /**
     * Get members for the unit leader's unit
     */
    public function getMembers(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $unit = $user->unit;
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 404);
            }

            $query = User::where('unit_id', $unit->id)
                ->where('role', 'member');

            // Apply role filter if provided
            if ($request->has('role')) {
                $query->where('role', $request->get('role'));
            }

            $members = $query->select('id', 'christian_name', 'family_name', 'phone', 'unit_id', 'status', 'created_at')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $members
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve members.'
            ], 500);
        }
    }

    /**
     * Update unit leader profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'christian_name' => 'required|string|max:255',
                'family_name' => 'required|string|max:255',
                'email' => 'nullable|email|max:255|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
                'id_passport' => 'nullable|string|max:50',
                'bio' => 'nullable|string|max:1000',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user->update($validator->validated());

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully',
                'data' => $user->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update profile: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update unit leader password
     */
    public function updatePassword(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'current_password' => 'required|string',
                'new_password' => 'required|string|min:8|confirmed',
                'new_password_confirmation' => 'required|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect'
                ], 422);
            }

            $user->update([
                'password' => Hash::make($request->new_password)
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update password: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update unit leader notification settings
     */
    public function updateNotifications(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Unit leader privileges required.'
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'email_notifications' => 'boolean',
                'sms_notifications' => 'boolean',
                'activity_alerts' => 'boolean',
                'report_reminders' => 'boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Store notification settings in user preferences or settings table
            // For now, we'll store them in the user's settings column if it exists
            $settings = $user->settings ?? [];
            $settings['notifications'] = $validator->validated();
            
            $user->update(['settings' => $settings]);

            return response()->json([
                'success' => true,
                'message' => 'Notification settings updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update notification settings: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get forms for unit leaders
     */
    public function getForms(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access. Unit leader role required.'
                ], 403);
            }

            // Get the unit leader's unit
            $unit = Unit::where('leader_id', $user->id)->first();
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 404);
            }

            $query = Form::query();

            // Filter by target roles if provided
            if ($request->has('target_roles')) {
                $targetRoles = explode(',', $request->target_roles);
                $query->where(function($q) use ($targetRoles) {
                    foreach ($targetRoles as $role) {
                        $q->orWhereJsonContains('target_roles', trim($role));
                    }
                });
            }

            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Get forms
            $forms = $query->where('status', 'active')->get();

            return response()->json([
                'success' => true,
                'data' => $forms,
                'message' => 'Forms retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching forms for unit leader: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve forms.'
            ], 500);
        }
    }

    /**
     * Get forms specifically assigned to the unit leader's unit
     */
    public function getAssignedForms(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access. Unit leader role required.'
                ], 403);
            }

            // Get the unit leader's unit
            $unit = Unit::where('leader_id', $user->id)->first();
            
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader.'
                ], 404);
            }

            // Get forms specifically assigned to this unit
            $query = Form::query()
                ->where('status', 'active')
                ->where(function($q) use ($unit) {
                    // Forms assigned to this specific unit
                    $q->whereJsonContains('target_units', $unit->id)
                      // Or forms assigned to unit leaders in general
                      ->orWhereJsonContains('target_roles', 'unit_leader');
                });

            // Filter by status if provided
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Get assigned forms
            $forms = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $forms,
                'message' => 'Assigned forms retrieved successfully.'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching assigned forms for unit leader: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve assigned forms.'
            ], 500);
        }
    }

} 