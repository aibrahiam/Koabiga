<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Unit;
use App\Models\Zone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MemberController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with(['unit', 'zone'])
            ->whereIn('role', ['member', 'unit_leader', 'zone_leader']);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('christian_name', 'like', "%{$search}%")
                  ->orWhere('family_name', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('secondary_phone', 'like', "%{$search}%")
                  ->orWhere('national_id', 'like', "%{$search}%");
            });
        }

        // Filter by role
        if ($request->filled('role') && $request->role !== 'all') {
            $query->where('role', $request->role);
        }

        // Filter by status
        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by zone
        if ($request->filled('zone_id') && $request->zone_id !== 'all') {
            $query->where('zone_id', $request->zone_id);
        }

        // Filter by unit
        if ($request->filled('unit_id') && $request->unit_id !== 'all') {
            $query->where('unit_id', $request->unit_id);
        }

        $members = $query->orderBy('created_at', 'desc')->paginate(15);

        // Get stats
        $stats = [
            'total_members' => User::whereIn('role', ['member', 'unit_leader', 'zone_leader'])->count(),
            'active_members' => User::whereIn('role', ['member', 'unit_leader', 'zone_leader'])->where('status', 'active')->count(),
            'inactive_members' => User::whereIn('role', ['member', 'unit_leader', 'zone_leader'])->where('status', 'inactive')->count(),
            'unit_leaders' => User::where('role', 'unit_leader')->count(),
            'zone_leaders' => User::where('role', 'zone_leader')->count(),
        ];

        return Inertia::render('koabiga/admin/members/members-management', [
            'members' => $members,
            'units' => Unit::all(),
            'zones' => Zone::all(),
            'stats' => $stats,
            'filters' => $request->only(['search', 'role', 'status', 'zone_id', 'unit_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('koabiga/admin/members/CreateMember', [
            'zones' => Zone::all(),
            'units' => Unit::with('zone')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'christian_name' => 'required|string|max:100',
            'family_name' => 'required|string|max:100',
            'phone' => 'required|digits:10|unique:users,phone',
            'secondary_phone' => 'nullable|digits:10|unique:users,secondary_phone',
            'pin' => 'required|digits:5',
            'gender' => 'required|in:male,female',
            'national_id' => 'required|string|max:25|unique:users,national_id',
            'status' => 'required|in:active,inactive',
            'role' => 'required|in:member,unit_leader,zone_leader',
        ]);

        // Ensure secondary phone is not the same as primary phone
        if ($validated['secondary_phone'] && $validated['secondary_phone'] === $validated['phone']) {
            return back()->withErrors(['secondary_phone' => 'Secondary phone number cannot be the same as primary phone number.']);
        }

        // Role-based validation
        switch ($request->role) {
            case 'zone_leader':
                $request->validate([
                    'zone_id' => 'required|exists:zones,id',
                    'unit_ids' => 'required|array|min:1',
                    'unit_ids.*' => 'exists:units,id'
                ]);
                break;
            case 'unit_leader':
                $request->validate([
                    'zone_id' => 'required|exists:zones,id',
                    'unit_id' => 'required|exists:units,id'
                ]);
                break;
            case 'member':
                $request->validate([
                    'unit_id' => 'required|exists:units,id'
                ]);
                // Auto-assign zone from unit
                $unit = Unit::find($request->unit_id);
                $validated['zone_id'] = $unit->zone_id;
                break;
        }

        // Hash the PIN
        $validated['pin'] = Hash::make($validated['pin']);
        
        // Generate email from name
        $validated['email'] = strtolower($validated['christian_name'] . '.' . $validated['family_name']) . '@koabiga.com';
        
        // Set default password
        $validated['password'] = Hash::make('password123');

        // Handle role-specific data
        if ($request->role === 'zone_leader') {
            $validated['zone_id'] = $request->zone_id;
            // For zone leaders, we'll store the primary unit_id and handle unit assignments separately
            $validated['unit_id'] = $request->unit_ids[0] ?? null;
        } elseif ($request->role === 'unit_leader') {
            $validated['zone_id'] = $request->zone_id;
            $validated['unit_id'] = $request->unit_id;
        } else {
            // member role - zone_id already set above
            $validated['unit_id'] = $request->unit_id;
        }

        User::create($validated);

        return redirect()->route('koabiga.admin.members.index')
            ->with('success', 'Member created successfully.');
    }

    public function show($id)
    {
        $member = User::with(['unit', 'zone'])->findOrFail($id);
        
        return Inertia::render('koabiga/admin/members/view-member', [
            'member' => $member,
        ]);
    }

    public function edit($id)
    {
        $member = User::with(['unit', 'zone'])->findOrFail($id);
        
        return Inertia::render('koabiga/admin/members/edit', [
            'member' => $member,
            'units' => Unit::all(),
            'zones' => Zone::all(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $member = User::findOrFail($id);

        $validated = $request->validate([
            'christian_name' => 'required|string|max:100',
            'family_name' => 'required|string|max:100',
            'phone' => 'required|digits:10|unique:users,phone,' . $id,
            'secondary_phone' => 'nullable|digits:10|unique:users,secondary_phone,' . $id,
            'pin' => 'required|digits:5',
            'gender' => 'required|in:male,female',
            'national_id' => 'required|string|max:25|unique:users,national_id,' . $id,
            'unit_id' => 'required|exists:units,id',
            'zone_id' => 'required|exists:zones,id',
            'status' => 'required|in:active,inactive',
            'role' => 'required|in:member,unit_leader,zone_leader',
        ]);

        // Ensure secondary phone is not the same as primary phone
        if ($validated['secondary_phone'] && $validated['secondary_phone'] === $validated['phone']) {
            return back()->withErrors(['secondary_phone' => 'Secondary phone number cannot be the same as primary phone number.']);
        }

        // Hash the PIN
        $validated['pin'] = Hash::make($validated['pin']);

        $member->update($validated);

        return redirect()->route('koabiga.admin.members.index')
            ->with('success', 'Member updated successfully.');
    }

    public function destroy($id)
    {
        $member = User::findOrFail($id);
        $member->delete();

        return redirect()->route('koabiga.admin.members.index')
            ->with('success', 'Member deleted successfully.');
    }

    public function export()
    {
        $members = User::with(['unit', 'zone'])
            ->whereIn('role', ['member', 'unit_leader', 'zone_leader'])
            ->get();

        $filename = 'members_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($members) {
            $file = fopen('php://output', 'w');
            
            // Add headers
            fputcsv($file, [
                'ID', 'Christian Name', 'Family Name', 'Phone', 'National ID', 
                'Gender', 'Role', 'Status', 'Unit', 'Zone', 'Created At'
            ]);

            // Add data
            foreach ($members as $member) {
                fputcsv($file, [
                    $member->id,
                    $member->christian_name,
                    $member->family_name,
                    $member->phone,
                    $member->national_id,
                    $member->gender,
                    $member->role,
                    $member->status,
                    $member->unit?->name ?? 'N/A',
                    $member->zone?->name ?? 'N/A',
                    $member->created_at->format('Y-m-d H:i:s'),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
} 