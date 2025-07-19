<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Unit;
use App\Models\Zone;
use App\Models\User;

class LeaderFormController extends Controller
{
    /**
     * Show the member creation form for leaders
     */
    public function memberCreation()
    {
        $user = Auth::user();
        
        if (!$user || !in_array($user->role, ['unit_leader', 'zone_leader'])) {
            abort(403, 'Access denied. Leader privileges required.');
        }

        // Get available units and zones based on leader's role
        $units = collect();
        $zones = collect();

        if ($user->role === 'unit_leader') {
            // Unit leaders can only see their own unit
            $unit = $user->unit;
            if ($unit) {
                $units = collect([$unit]);
                $zones = collect([$unit->zone]);
            }
        } else if ($user->role === 'zone_leader') {
            // Zone leaders can see all units in their zone
            $zone = Zone::find($user->zone_id);
            if ($zone) {
                $units = Unit::where('zone_id', $user->zone_id)->get();
                $zones = collect([$zone]);
            }
        }

        // Prepare leader user data
        $leaderUser = [
            'id' => $user->id,
            'role' => $user->role,
            'unit_id' => $user->unit_id,
            'zone_id' => $user->zone_id,
            'christian_name' => $user->christian_name,
            'family_name' => $user->family_name,
        ];

        return Inertia::render('koabiga/leaders/leaders-forms/member-creation', [
            'units' => $units,
            'zones' => $zones,
            'leaderUser' => $leaderUser,
        ]);
    }

    /**
     * Show the land assignment form for leaders
     */
    public function landAssignment()
    {
        $user = Auth::user();
        
        if (!$user || !in_array($user->role, ['unit_leader', 'zone_leader'])) {
            abort(403, 'Access denied. Leader privileges required.');
        }

        return Inertia::render('koabiga/leaders/leaders-forms/land-assignment');
    }

    /**
     * Show the crop creation form for leaders
     */
    public function cropCreation()
    {
        $user = Auth::user();
        
        if (!$user || !in_array($user->role, ['unit_leader', 'zone_leader'])) {
            abort(403, 'Access denied. Leader privileges required.');
        }

        return Inertia::render('koabiga/leaders/leaders-forms/crop-creation');
    }

    /**
     * Show the produce creation form for leaders
     */
    public function produceCreation()
    {
        $user = Auth::user();
        
        if (!$user || !in_array($user->role, ['unit_leader', 'zone_leader'])) {
            abort(403, 'Access denied. Leader privileges required.');
        }

        return Inertia::render('koabiga/leaders/leaders-forms/produce-creation');
    }
} 