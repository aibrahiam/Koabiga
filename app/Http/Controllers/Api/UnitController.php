<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Unit;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Support\Facades\DB;

class UnitController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Unit::with(['zone', 'leader'])
            ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by zone if provided
        if ($request->has('zone_id')) {
            $query->where('zone_id', $request->zone_id);
        }

        // Search by name or code
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $units = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $units->items(),
            'pagination' => [
                'current_page' => $units->currentPage(),
                'last_page' => $units->lastPage(),
                'per_page' => $units->perPage(),
                'total' => $units->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:units,code',
            'description' => 'nullable|string',
            'zone_id' => 'required|exists:zones,id',
            'leader_id' => 'nullable|exists:users,id',
            'status' => 'required|in:active,inactive',
        ]);

        $unit = Unit::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Unit created successfully',
            'data' => $unit->load(['zone', 'leader'])
        ], 201);
    }

    public function show(Unit $unit): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $unit->load(['zone', 'leader', 'members'])
        ]);
    }

    public function update(Request $request, Unit $unit): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:units,code,' . $unit->id,
            'description' => 'nullable|string',
            'zone_id' => 'required|exists:zones,id',
            'leader_id' => 'nullable|exists:users,id',
            'status' => 'required|in:active,inactive',
        ]);

        $unit->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Unit updated successfully',
            'data' => $unit->load(['zone', 'leader'])
        ]);
    }

    public function destroy(Unit $unit): JsonResponse
    {
        // Check if unit has members
        if ($unit->members()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete unit with existing members'
            ], 400);
        }

        $unit->delete();

        return response()->json([
            'success' => true,
            'message' => 'Unit deleted successfully'
        ]);
    }

    public function getMembers(Unit $unit): JsonResponse
    {
        $members = $unit->members()
            ->select('id', 'christian_name', 'family_name', 'phone', 'email', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $members
        ]);
    }

    public function addMember(Request $request, Unit $unit): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::find($validated['user_id']);
        
        if ($user->unit_id) {
            return response()->json([
                'success' => false,
                'message' => 'User is already assigned to a unit'
            ], 400);
        }

        $user->update(['unit_id' => $unit->id]);

        return response()->json([
            'success' => true,
            'message' => 'Member added to unit successfully',
            'data' => $user
        ]);
    }

    public function removeMember(Unit $unit, int $memberId): JsonResponse
    {
        $user = User::where('id', $memberId)
            ->where('unit_id', $unit->id)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found in this unit'
            ], 404);
        }

        $user->update(['unit_id' => null]);

        return response()->json([
            'success' => true,
            'message' => 'Member removed from unit successfully'
        ]);
    }

    public function statistics(): JsonResponse
    {
        $stats = [
            'total' => Unit::count(),
            'active' => Unit::where('status', 'active')->count(),
            'inactive' => Unit::where('status', 'inactive')->count(),
            'units_with_leaders' => Unit::whereNotNull('leader_id')->count(),
            'units_without_leaders' => Unit::whereNull('leader_id')->count(),
            'total_members' => User::where('role', 'member')->count(),
            'assigned_members' => User::where('role', 'member')->whereNotNull('unit_id')->count(),
            'unassigned_members' => User::where('role', 'member')->whereNull('unit_id')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
} 