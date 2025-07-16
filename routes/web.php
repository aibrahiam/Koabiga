<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return Inertia::render('auth/welcome');
})->name('home');

// Custom error routes
Route::get('/unauthorized', function () {
    return Inertia::render('errors/unauthorized');
})->name('unauthorized');

// Login routes are handled in routes/auth.php

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
            return redirect()->route('koabiga.unit-leader.dashboard');
        case 'member':
            return redirect()->route('koabiga.member.dashboard');
        default:
            return redirect()->route('home');
    }
})->name('dashboard')->middleware(['auth']);

// Koabiga Admin Routes (Protected with authentication and admin role)
Route::prefix('koabiga/admin')->name('koabiga.admin.')->middleware(['auth', 'role:admin'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('koabiga/admin/admin_dashboard');
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
    
    Route::get('forms/{id}/assigned-members', function ($id) {
        return Inertia::render('koabiga/admin/forms/form-assigned-members', ['id' => $id]);
    })->name('forms.assigned-members');
    
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
        return Inertia::render('koabiga/admin/zones/zone');
    })->name('zones');

    Route::get('zones/create', function () {
        return Inertia::render('koabiga/admin/zones/create-zone');
    })->name('zones.create');

    Route::get('zones/{id}/edit', function ($id) {
        return Inertia::render('koabiga/admin/zones/edit-zone', ['id' => $id]);
    })->name('zones.edit');
});

// Koabiga Member Routes (Public for frontend testing)
Route::prefix('koabiga/member')->name('koabiga.member.')->middleware(['auth', 'role:member'])->group(function () {
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

// Koabiga Unit Leader Routes
Route::prefix('koabiga/unit-leader')->name('koabiga.unit-leader.')->middleware(['auth', 'verified', 'role:unit_leader'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('koabiga/unit-leader/leader-dashboard');
    })->name('dashboard');
    
    Route::get('leader-members', function () {
        return Inertia::render('koabiga/unit-leader/leader-members');
    })->name('leader-members');
    
    Route::get('land', function () {
        return Inertia::render('koabiga/unit-leader/land');
    })->name('land');
    
    Route::get('crops', function () {
        return Inertia::render('koabiga/unit-leader/crops');
    })->name('crops');
    
    Route::get('produce', function () {
        return Inertia::render('koabiga/unit-leader/produce');
    })->name('produce');
    
    Route::get('reports', function () {
        return Inertia::render('koabiga/unit-leader/reports');
    })->name('reports');
    
    Route::get('forms', function () {
        return Inertia::render('koabiga/unit-leader/leader-form');
    })->name('forms');
    
    Route::get('forms/member-creation', function () {
        return Inertia::render('koabiga/unit-leader/forms/member-creation');
    })->name('forms.member-creation');
    
    Route::get('forms/land-assignment', function () {
        return Inertia::render('koabiga/unit-leader/forms/land-assignment');
    })->name('forms.land-assignment');
    
    Route::get('forms/crop-creation', function () {
        return Inertia::render('koabiga/unit-leader/forms/crop-creation');
    })->name('forms.crop-creation');
    
    Route::get('forms/produce-creation', function () {
        return Inertia::render('koabiga/unit-leader/forms/produce-creation');
    })->name('forms.produce-creation');
    
    Route::get('settings', function () {
        return Inertia::render('koabiga/unit-leader/settings');
    })->name('settings');
});

// Unit Leader Forms - Dynamic Form Route
Route::get('/koabiga/unit-leader/forms/dynamic/{formId}', function ($formId) {
    return Inertia::render('koabiga/unit-leader/forms/dynamic-form', ['formId' => $formId]);
})->middleware(['auth', 'role:unit_leader']);


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
