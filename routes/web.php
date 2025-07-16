<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Custom error routes
Route::get('/unauthorized', function () {
    return Inertia::render('errors/unauthorized');
})->name('unauthorized');

Route::get('/home', function () {
    return Inertia::render('auth/welcome');
})->name('home');

// Main Dashboard Route - Role-based redirect
Route::get('/dashboard', function () {
    $user = Auth::user();
    
    if (!$user) {
        return redirect()->route('home');
    }
    
    // Redirect based on user role
    switch ($user->role) {
        case 'admin':
            return redirect()->route('koabiga.admin.dashboard');
        case 'unit_leader':
            return redirect()->route('koabiga.leaders.dashboard');
        case 'member':
            return redirect()->route('koabiga.members.dashboard');
        default:
            return redirect()->route('home');
    }
})->name('dashboard')->middleware(['auth']);

// Koabiga Admin Routes (Protected with authentication and admin role)
Route::prefix('koabiga/admin')->name('koabiga.admin.')->middleware(['auth', 'role:admin'])->group(function () {
    Route::get('dashboard', function () {
        // Get zone statistics
        $zoneStats = [
            'total_zones' => \App\Models\Zone::count(),
            'active_zones' => \App\Models\Zone::where('status', 'active')->count(),
            'inactive_zones' => \App\Models\Zone::where('status', 'inactive')->count(),
            'zones_with_leaders' => \App\Models\Zone::whereNotNull('leader_id')->count(),
            'zones_without_leaders' => \App\Models\Zone::whereNull('leader_id')->count(),
        ];

        // Get recent zones
        $recentZones = \App\Models\Zone::with('leader')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($zone) {
                return [
                    'id' => $zone->id,
                    'name' => $zone->name,
                    'code' => $zone->code,
                    'leader' => $zone->leader ? $zone->leader->christian_name . ' ' . $zone->leader->family_name : 'No Leader',
                    'status' => $zone->status,
                    'created_at' => $zone->created_at->diffForHumans(),
                ];
            });

        return Inertia::render('koabiga/admin/admin_dashboard', [
            'zoneStats' => $zoneStats,
            'recentZones' => $recentZones,
        ]);
    })->name('dashboard');
    
    // Members Management
    Route::get('members', function () {
        return Inertia::render('koabiga/admin/members/members');
    })->name('members');
    
    Route::get('members/create-member', function () {
        return Inertia::render('koabiga/admin/members/create-member');
    })->name('members.create');

    Route::get('members/{id}', function ($id) {
        return Inertia::render('koabiga/admin/members/view-member', ['id' => $id]);
    })->name('members.show');

    Route::get('members/{id}/edit', function ($id) {
        return Inertia::render('koabiga/admin/members/edit-member', ['id' => $id]);
    })->name('members.edit');
    
    // Units Management
    Route::get('units', function () {
        return Inertia::render('koabiga/admin/units/units');
    })->name('units');
    
    Route::get('units/create_unit', function () {
        return Inertia::render('koabiga/admin/units/create_unit');
    })->name('units.create_unit');

    Route::get('units/{id}', function ($id) {
        return Inertia::render('koabiga/admin/units/[id]', ['id' => $id]);
    })->name('units.show');

    Route::get('units/{id}/edit', function ($id) {
        return Inertia::render('koabiga/admin/units/[id]/edit', ['id' => $id]);
    })->name('units.edit');

    Route::get('units/{id}/members', function ($id) {
        return Inertia::render('koabiga/admin/units/[id]/members', [
            'unitId' => $id,
            'unit' => [
                'id' => $id,
                'name' => 'Unit ' . $id,
                'code' => 'U' . str_pad($id, 3, '0', STR_PAD_LEFT),
                'leader' => 'Unit Leader ' . $id,
            ]
        ]);
    })->name('units.members');

    Route::get('units/{id}/view', function ($id) {
        return Inertia::render('koabiga/admin/units/[id]/view', ['id' => $id]);
    })->name('units.view');
    
    // Reports Management
    Route::get('reports', function () {
        return Inertia::render('koabiga/admin/reports/reports');
    })->name('reports');
    
    Route::get('reports/generate-report', function () {
        return Inertia::render('koabiga/admin/reports/generate-report');
    })->name('reports.generate');
    
    // Fee Rules Management
    Route::get('fee-rules', function () {
        return Inertia::render('koabiga/admin/fee-rules/fee-rules');
    })->name('fee-rules');
    
    Route::get('fee-rules/create-fee', function () {
        return Inertia::render('koabiga/admin/fee-rules/create-fee');
    })->name('fee-rules.create-fee');

    Route::get('fee-rules/{id}', function ($id) {
        return Inertia::render('koabiga/admin/fee-rules/view-fee', ['id' => $id]);
    })->name('fee-rules.show');

    Route::get('fee-rules/{id}/edit', function ($id) {
        return Inertia::render('koabiga/admin/fee-rules/edit-fee', ['id' => $id]);
    })->name('fee-rules.edit');
    
    // Settings
    Route::get('settings', function () {
        return Inertia::render('koabiga/admin/settings');
    })->name('settings');
    
    // Forms Management
    Route::get('forms', function () {
        return Inertia::render('koabiga/admin/forms/forms');
    })->name('forms');

    Route::get('forms/create', function () {
        return Inertia::render('koabiga/admin/forms/create-form');
    })->name('forms.create');
    
    Route::get('forms/{id}', function ($id) {
        return Inertia::render('koabiga/admin/forms/view-form', ['id' => $id]);
    })->name('forms.show');
    
    Route::get('forms/{id}/edit', function ($id) {
        return Inertia::render('koabiga/admin/forms/edit-form', ['id' => $id]);
    })->name('forms.edit');
    
    // Page Management
    Route::get('page-management', function () {
        return Inertia::render('koabiga/admin/pages/page-management');
    })->name('page-management');

    Route::get('pages/{id}/edit', function ($id) {
        return Inertia::render('koabiga/admin/pages/edit-page', ['id' => $id]);
    })->name('pages.edit');

    // System Monitoring
    Route::get('logs', function () {
        return Inertia::render('koabiga/admin/system-log/logs');
    })->name('logs');

    Route::get('activity-logs', function () {
        return Inertia::render('koabiga/admin/monitoring/activity-logs');
    })->name('activity-logs');

    Route::get('error-logs', function () {
        return Inertia::render('koabiga/admin/system-log/error-logs');
    })->name('error-logs');

    Route::get('login-sessions', function () {
        return Inertia::render('koabiga/admin/system-log/login-sessions');
    })->name('login-sessions');

    Route::get('system-metrics', function () {
        return Inertia::render('koabiga/admin/system-log/system-metrics');
    })->name('system-metrics');

    // Zone Management
    Route::get('zones', function () {
        $zones = \App\Models\Zone::with('leader')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($zone) {
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
                    'location' => $zone->location ?? null,
                    'performance_score' => rand(65, 95), // Placeholder - should be calculated based on actual metrics
                    'last_activity' => $zone->updated_at->diffForHumans(),
                ];
            });

        $stats = [
            'total_zones' => \App\Models\Zone::count(),
            'active_zones' => \App\Models\Zone::where('status', 'active')->count(),
            'inactive_zones' => \App\Models\Zone::where('status', 'inactive')->count(),
            'total_members' => \App\Models\User::where('role', 'member')->count(),
            'total_units' => \App\Models\Unit::count(),
            'average_performance' => 85, // Placeholder - should be calculated based on actual metrics
        ];

        $filters = [
            'status' => request('status', ''),
            'leader' => request('leader', ''),
            'search' => request('search', ''),
        ];

        return Inertia::render('koabiga/admin/zones/zone', [
            'zones' => $zones,
            'stats' => $stats,
            'filters' => $filters,
        ]);
    })->name('zones');

    Route::get('zones/create', function () {
        // Get available leaders for selection
        $availableLeaders = \App\Models\User::where('role', 'unit_leader')
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

        return Inertia::render('koabiga/admin/zones/create-zone', [
            'availableLeaders' => $availableLeaders,
        ]);
    })->name('zones.create');

    Route::get('zones/{id}', function ($id) {
        $zone = \App\Models\Zone::with('leader', 'units.members')->findOrFail($id);
        
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
            'location' => $zone->location ?? null,
            'performance_score' => rand(65, 95),
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

        return Inertia::render('koabiga/admin/zones/view-zone', [
            'zone' => $zoneData,
        ]);
    })->name('zones.show');

    Route::get('zones/{id}/edit', function ($id) {
        $zone = \App\Models\Zone::with('leader')->findOrFail($id);
        
        $zoneData = [
            'id' => $zone->id,
            'name' => $zone->name,
            'code' => $zone->code,
            'leader_id' => $zone->leader_id,
            'status' => $zone->status,
            'description' => $zone->description,
            'location' => $zone->location ?? null,
        ];

        // Get available leaders for selection
        $availableLeaders = \App\Models\User::where('role', 'unit_leader')
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

        return Inertia::render('koabiga/admin/zones/edit-zone', [
            'zone' => $zoneData,
            'availableLeaders' => $availableLeaders,
        ]);
    })->name('zones.edit');
});

// Koabiga Members Routes
Route::prefix('koabiga/members')->name('koabiga.members.')->middleware(['auth', 'role:member'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('koabiga/member/dashboard'); // Use the member dashboard
    })->name('dashboard');
    
    Route::get('land', function () {
        return Inertia::render('koabiga/member/land');
    })->name('land');
    
    Route::get('crops', function () {
        return Inertia::render('koabiga/member/crops');
    })->name('crops');
    
    Route::get('produce', function () {
        return Inertia::render('koabiga/member/produce');
    })->name('produce');
    
    Route::get('reports', function () {
        return Inertia::render('koabiga/member/reports');
    })->name('reports');
    
    Route::get('forms', function () {
        return Inertia::render('koabiga/member/forms');
    })->name('forms');

    // Add Fees route
    Route::get('fees', function () {
        return Inertia::render('koabiga/member/fees');
    })->name('fees');
});

// Koabiga Leaders Routes
Route::prefix('koabiga/leaders')->name('koabiga.leaders.')->middleware(['auth', 'verified', 'role:unit_leader'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('koabiga/leaders/leader-dashboard');
    })->name('dashboard');
    
    Route::get('leader-members', function () {
        return Inertia::render('koabiga/leaders/leader-members');
    })->name('leader-members');
    
    Route::get('land', function () {
        return Inertia::render('koabiga/leaders/land');
    })->name('land');
    
    Route::get('crops', function () {
        return Inertia::render('koabiga/leaders/crops');
    })->name('crops');
    
    Route::get('produce', function () {
        return Inertia::render('koabiga/leaders/produce');
    })->name('produce');
    
    Route::get('reports', function () {
        return Inertia::render('koabiga/leaders/reports');
    })->name('reports');
    
    Route::get('forms', function () {
        return Inertia::render('koabiga/leaders/leader-form');
    })->name('forms');
    
    Route::get('forms/member-creation', function () {
        return Inertia::render('koabiga/leaders/forms/member-creation');
    })->name('forms.member-creation');
    
    Route::get('forms/land-assignment', function () {
        return Inertia::render('koabiga/leaders/forms/land-assignment');
    })->name('forms.land-assignment');
    
    Route::get('forms/crop-creation', function () {
        return Inertia::render('koabiga/leaders/forms/crop-creation');
    })->name('forms.crop-creation');
    
    Route::get('forms/produce-creation', function () {
        return Inertia::render('koabiga/leaders/forms/produce-creation');
    })->name('forms.produce-creation');
    
    Route::get('settings', function () {
        return Inertia::render('koabiga/leaders/settings');
    })->name('settings');
});



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
