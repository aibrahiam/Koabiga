<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Zone;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ZoneController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Zone::with('leader')
                ->orderBy('created_at', 'desc');

            // Filter by status if provided
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }

            // Search by name or code
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('code', 'like', "%{$search}%");
                });
            }

            $zones = $query->get()->map(function ($zone) {
                return [
                    'id' => $zone->id,
                    'name' => $zone->name,
                    'code' => $zone->code,
                    'leader' => $zone->leader ? [
                        'id' => $zone->leader->id,
                        'name' => $zone->leader->christian_name . ' ' . $zone->leader->family_name,
                        'email' => $zone->leader->email,
                        'phone' => $zone->leader->phone,
                    ] : null,
                    'member_count' => $zone->units()->withCount('members')->get()->sum('members_count'),
                    'unit_count' => $zone->units()->count(),
                    'status' => $zone->status,
                    'created_at' => $zone->created_at->toISOString(),
                    'updated_at' => $zone->updated_at->toISOString(),
                    'description' => $zone->description,
                    'location' => $zone->location,
                    'performance_score' => 85, // Placeholder - should be calculated based on actual metrics
                    'last_activity' => $zone->updated_at->diffForHumans(),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $zones,
                'pagination' => [
                    'current_page' => 1,
                    'last_page' => 1,
                    'per_page' => $zones->count(),
                    'total' => $zones->count(),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Zone index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch zones: ' . $e->getMessage()
            ], 500);
        }
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