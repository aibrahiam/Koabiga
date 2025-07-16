<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Models\Zone;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    /**
     * Display a listing of units.
     */
    public function index(): Response
    {
        $units = Unit::with(['zone', 'leader'])
            ->orderBy('name')
            ->get()
            ->map(function ($unit) {
                return [
                    'id' => $unit->id,
                    'name' => $unit->name,
                    'code' => $unit->code,
                    'zone_id' => $unit->zone_id,
                    'leader_id' => $unit->leader_id,
                    'status' => $unit->status,
                    'created_at' => $unit->created_at->toISOString(),
                    'updated_at' => $unit->updated_at->toISOString(),
                    'zone' => [
                        'id' => $unit->zone->id,
                        'name' => $unit->zone->name,
                        'code' => $unit->zone->code,
                    ],
                    'leader' => $unit->leader ? [
                        'id' => $unit->leader->id,
                        'christian_name' => $unit->leader->christian_name,
                        'family_name' => $unit->leader->family_name,
                        'phone' => $unit->leader->phone,
                        'secondary_phone' => $unit->leader->secondary_phone,
                    ] : null,
                ];
            });

        $zones = Zone::orderBy('name')->get(['id', 'name', 'code']);
        
        $leaders = User::where('role', 'unit_leader')
            ->orderBy('christian_name')
            ->get(['id', 'christian_name', 'family_name', 'phone', 'secondary_phone']);

        return Inertia::render('koabiga/admin/units/UnitsManagement', [
            'units' => $units,
            'zones' => $zones,
            'leaders' => $leaders,
        ]);
    }

    /**
     * Store a newly created unit.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:50|unique:units,code',
            'zone_id' => 'required|exists:zones,id',
            'leader_id' => 'nullable|exists:users,id',
            'status' => 'required|in:active,inactive',
        ]);

        $unit = Unit::create([
            'name' => $request->name,
            'code' => $request->code,
            'zone_id' => $request->zone_id,
            'leader_id' => $request->leader_id,
            'status' => $request->status,
        ]);

        return redirect()->route('koabiga.admin.units.index')
            ->with('success', 'Unit created successfully.');
    }

    /**
     * Show the form for editing the specified unit.
     */
    public function edit(Unit $unit): Response
    {
        $unit->load(['zone', 'leader']);
        
        $zones = Zone::orderBy('name')->get(['id', 'name', 'code']);
        
        $leaders = User::where('role', 'unit_leader')
            ->orderBy('christian_name')
            ->get(['id', 'christian_name', 'family_name', 'phone', 'secondary_phone']);

        return Inertia::render('koabiga/admin/units/edit', [
            'unit' => [
                'id' => $unit->id,
                'name' => $unit->name,
                'code' => $unit->code,
                'zone_id' => $unit->zone_id,
                'leader_id' => $unit->leader_id,
                'status' => $unit->status,
                'zone' => [
                    'id' => $unit->zone->id,
                    'name' => $unit->zone->name,
                    'code' => $unit->zone->code,
                ],
                'leader' => $unit->leader ? [
                    'id' => $unit->leader->id,
                    'christian_name' => $unit->leader->christian_name,
                    'family_name' => $unit->leader->family_name,
                    'phone' => $unit->leader->phone,
                    'secondary_phone' => $unit->leader->secondary_phone,
                ] : null,
            ],
            'zones' => $zones,
            'leaders' => $leaders,
        ]);
    }

    /**
     * Update the specified unit.
     */
    public function update(Request $request, Unit $unit)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'code' => ['required', 'string', 'max:50', Rule::unique('units', 'code')->ignore($unit->id)],
            'zone_id' => 'required|exists:zones,id',
            'leader_id' => 'nullable|exists:users,id',
            'status' => 'required|in:active,inactive',
        ]);

        $unit->update([
            'name' => $request->name,
            'code' => $request->code,
            'zone_id' => $request->zone_id,
            'leader_id' => $request->leader_id,
            'status' => $request->status,
        ]);

        return redirect()->route('koabiga.admin.units.index')
            ->with('success', 'Unit updated successfully.');
    }

    /**
     * Remove the specified unit.
     */
    public function destroy(Unit $unit)
    {
        // Check if unit has members
        if ($unit->members()->count() > 0) {
            return back()->with('error', 'Cannot delete unit that has members. Please reassign or remove members first.');
        }

        $unit->delete();

        return redirect()->route('koabiga.admin.units.index')
            ->with('success', 'Unit deleted successfully.');
    }
} 