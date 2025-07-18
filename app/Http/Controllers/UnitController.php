<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitController extends Controller
{
    public function index(): Response
    {
        $units = Unit::with(['zone', 'leader'])
            ->orderBy('created_at', 'desc')
            ->get();



        $zones = Zone::orderBy('name')->get();
        
        $leaders = User::whereIn('role', ['unit_leader', 'zone_leader'])
            ->orderBy('christian_name')
            ->get();

        return Inertia::render('koabiga/admin/units/UnitsManagement', [
            'units' => $units,
            'zones' => $zones,
            'leaders' => $leaders,
        ]);
    }

    public function create(): Response
    {
        $zones = Zone::orderBy('name')->get();
        
        $leaders = User::whereIn('role', ['unit_leader', 'zone_leader'])
            ->orderBy('christian_name')
            ->get();

        return Inertia::render('koabiga/admin/units/create_unit', [
            'zones' => $zones,
            'availableLeaders' => $leaders,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50|unique:units,code',
            'zone_id' => 'required|exists:zones,id',
            'leader_id' => 'nullable|exists:users,id',
            'status' => 'required|in:active,inactive',
        ]);

        // If no code is provided, generate one automatically
        if (empty($validated['code']) && $validated['zone_id']) {
            $validated['code'] = Unit::generateCode($validated['zone_id']);
        }

        Unit::create($validated);

        return redirect()->route('koabiga.admin.units.index')
            ->with('success', 'Unit created successfully');
    }

    public function show(Unit $unit): Response
    {
        $unit->load(['zone', 'leader', 'members']);

        return Inertia::render('koabiga/admin/units/[id]/view', [
            'unit' => $unit,
        ]);
    }

    public function members(Unit $unit): Response
    {
        $unit->load(['zone', 'leader']);
        
        $members = User::where('unit_id', $unit->id)
            ->where('role', 'member')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('koabiga/admin/units/[id]/members', [
            'unit' => $unit,
            'members' => $members,
        ]);
    }

    public function edit(Unit $unit): Response
    {
        $unit->load(['zone', 'leader']);

        $zones = Zone::orderBy('name')->get();
        
        $leaders = User::whereIn('role', ['unit_leader', 'zone_leader'])
            ->orderBy('christian_name')
            ->get();

        return Inertia::render('koabiga/admin/units/[id]/edit-unit', [
            'unit' => $unit,
            'zones' => $zones,
            'availableLeaders' => $leaders,
        ]);
    }

    public function update(Request $request, Unit $unit)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:units,code,' . $unit->id,
            'zone_id' => 'required|exists:zones,id',
            'leader_id' => 'nullable|exists:users,id',
            'status' => 'required|in:active,inactive',
        ]);

        $unit->update($validated);

        return redirect()->route('koabiga.admin.units.show', $unit)
            ->with('success', 'Unit updated successfully');
    }

    public function destroy(Unit $unit)
    {
        // Check if unit has members
        if ($unit->members()->count() > 0) {
            return back()->with('error', 'Cannot delete unit with existing members');
        }

        $unit->delete();

        return redirect()->route('koabiga.admin.units.index')
            ->with('success', 'Unit deleted successfully');
    }

    public function generateCode(Request $request)
    {
        try {
            $zoneId = $request->input('zone_id');
            $code = Unit::generateCode($zoneId);
            
            return response()->json([
                'success' => true,
                'code' => $code,
                'message' => 'Unit code generated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
} 