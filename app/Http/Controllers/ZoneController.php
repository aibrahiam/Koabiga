<?php

namespace App\Http\Controllers;

use App\Models\Zone;
use App\Models\User;
use App\Models\Unit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ZoneController extends Controller
{
    public function index(Request $request): Response
    {
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

        // Get zone statistics
        $stats = [
            'total_zones' => Zone::count(),
            'active_zones' => Zone::where('status', 'active')->count(),
            'inactive_zones' => Zone::where('status', 'inactive')->count(),
            'total_members' => User::where('role', 'member')->count(),
            'total_units' => Unit::count(),
            'average_performance' => 85, // Placeholder
        ];

        return Inertia::render('koabiga/admin/admin-zones/zone', [
            'zones' => $zones,
            'stats' => $stats,
            'filters' => [
                'status' => $request->get('status', ''),
                'search' => $request->get('search', ''),
            ],
        ]);
    }

    public function create(): Response
    {
        // Get available leaders for selection
        $availableLeaders = User::where('role', 'unit_leader')
            ->whereNull('zone_id')
            ->select('id', 'christian_name', 'family_name', 'email', 'phone')
            ->get()
            ->map(function ($leader) {
                return [
                    'id' => $leader->id,
                    'name' => $leader->christian_name . ' ' . $leader->family_name,
                    'email' => $leader->email,
                    'phone' => $leader->phone,
                ];
            });

        return Inertia::render('koabiga/admin/admin-zones/create-zone', [
            'availableLeaders' => $availableLeaders,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:zones,code',
            'description' => 'nullable|string',
            'location' => 'nullable|string',
            'leader_id' => 'nullable|exists:users,id',
            'status' => 'required|in:active,inactive',
        ]);

        $zone = Zone::create($validated);

        return redirect('/koabiga/admin/admin-zones')
            ->with('success', 'Zone created successfully');
    }

    public function show(Zone $zone): Response
    {
        $zoneData = [
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
            'performance_score' => 85, // Placeholder
            'last_activity' => $zone->updated_at->diffForHumans(),
            'units' => $zone->units->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->name,
                    'code' => $unit->code,
                    'member_count' => $unit->members()->count(),
                    'leader' => $unit->leader ? [
                        'id' => $unit->leader->id,
                        'name' => $unit->leader->christian_name . ' ' . $unit->leader->family_name,
                    ] : null,
                ];
            }),
        ];

        return Inertia::render('koabiga/admin/admin-zones/view-zone', [
            'zone' => $zoneData,
        ]);
    }

    public function edit(Zone $zone): Response
    {
        $zoneData = [
            'id' => $zone->id,
            'name' => $zone->name,
            'code' => $zone->code,
            'leader_id' => $zone->leader_id,
            'status' => $zone->status,
            'description' => $zone->description,
            'location' => $zone->location,
        ];

        // Get available leaders for selection
        $availableLeaders = User::where('role', 'unit_leader')
            ->whereNull('zone_id')
            ->orWhere('zone_id', $zone->id)
            ->select('id', 'christian_name', 'family_name', 'email', 'phone')
            ->get()
            ->map(function ($leader) {
                return [
                    'id' => $leader->id,
                    'name' => $leader->christian_name . ' ' . $leader->family_name,
                    'email' => $leader->email,
                    'phone' => $leader->phone,
                ];
            });

        return Inertia::render('koabiga/admin/admin-zones/edit-zone', [
            'zone' => $zoneData,
            'availableLeaders' => $availableLeaders,
        ]);
    }

    public function update(Request $request, Zone $zone)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:zones,code,' . $zone->id,
            'description' => 'nullable|string',
            'location' => 'nullable|string',
            'leader_id' => 'nullable|exists:users,id',
            'status' => 'required|in:active,inactive',
        ]);

        $zone->update($validated);

        return redirect("/koabiga/admin/admin-zones/{$zone->id}")
            ->with('success', 'Zone updated successfully');
    }

    public function destroy(Zone $zone)
    {
        // Check if zone has units
        if ($zone->units()->count() > 0) {
            return back()->with('error', 'Cannot delete zone with existing units');
        }

        $zone->delete();

        return redirect('/koabiga/admin/admin-zones')
            ->with('success', 'Zone deleted successfully');
    }
} 