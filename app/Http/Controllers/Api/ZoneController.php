<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Zone;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ZoneController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Zone::with('leader')
            ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by name or code
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $zones = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $zones->items(),
            'pagination' => [
                'current_page' => $zones->currentPage(),
                'last_page' => $zones->lastPage(),
                'per_page' => $zones->perPage(),
                'total' => $zones->total(),
            ]
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:zones,code',
            'description' => 'nullable|string',
            'leader_id' => 'nullable|exists:users,id',
            'status' => 'required|in:active,inactive',
        ]);

        $zone = Zone::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Zone created successfully',
            'data' => $zone->load('leader')
        ], 201);
    }

    public function statistics(): JsonResponse
    {
        $stats = [
            'total_zones' => Zone::count(),
            'active_zones' => Zone::where('status', 'active')->count(),
            'inactive_zones' => Zone::where('status', 'inactive')->count(),
            'zones_with_leaders' => Zone::whereNotNull('leader_id')->count(),
            'zones_without_leaders' => Zone::whereNull('leader_id')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function getAvailableLeaders(): JsonResponse
    {
        $leaders = User::where('role', 'unit_leader')
            ->whereNull('zone_id')
            ->select('id', 'christian_name', 'family_name', 'phone')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $leaders
        ]);
    }

    public function show(Zone $zone): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $zone->load('leader', 'units')
        ]);
    }

    public function update(Request $request, Zone $zone): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:zones,code,' . $zone->id,
            'description' => 'nullable|string',
            'leader_id' => 'nullable|exists:users,id',
            'status' => 'required|in:active,inactive',
        ]);

        $zone->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Zone updated successfully',
            'data' => $zone->load('leader')
        ]);
    }

    public function destroy(Zone $zone): JsonResponse
    {
        // Check if zone has units
        if ($zone->units()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete zone with existing units'
            ], 400);
        }

        $zone->delete();

        return response()->json([
            'success' => true,
            'message' => 'Zone deleted successfully'
        ]);
    }
} 