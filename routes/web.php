<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// Custom error routes
Route::get('/unauthorized', function () {
    return Inertia::render('errors/unauthorized');
})->name('unauthorized');



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
    Route::get('dashboard', [\App\Http\Controllers\Admin\DashboardController::class, 'index'])->name('dashboard');
    
    // Members Management (handled by resource routes below)
    
    // Generate unit code (must come before resource route)
    Route::post('units/generate-code', [\App\Http\Controllers\UnitController::class, 'generateCode'])->name('units.generate-code');
    
    // Units Management
    Route::resource('units', \App\Http\Controllers\UnitController::class)->names([
        'index' => 'units.index',
        'create' => 'units.create',
        'store' => 'units.store',
        'show' => 'units.show',
        'edit' => 'units.edit',
        'update' => 'units.update',
        'destroy' => 'units.destroy',
    ]);



    Route::get('units/{unit}/members', [\App\Http\Controllers\UnitController::class, 'members'])->name('units.members');
    
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
    Route::resource('zones', \App\Http\Controllers\ZoneController::class)->names([
        'index' => 'zones.index',
        'create' => 'zones.create',
        'store' => 'zones.store',
        'show' => 'zones.show',
        'edit' => 'zones.edit',
        'update' => 'zones.update',
        'destroy' => 'zones.destroy',
    ]);

    // Members Management
    Route::resource('members', \App\Http\Controllers\Admin\MemberController::class)->names([
        'index' => 'members.index',
        'create' => 'members.create',
        'store' => 'members.store',
        'edit' => 'members.edit',
        'update' => 'members.update',
        'destroy' => 'members.destroy',
    ]);
    Route::get('members/export', [\App\Http\Controllers\Admin\MemberController::class, 'export'])->name('members.export');
});

// Koabiga Members Routes
Route::prefix('koabiga/members')->name('koabiga.members.')->middleware(['auth', 'role:member'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('koabiga/member/member_dashboard'); // Use the member dashboard
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
Route::prefix('koabiga/leaders')->name('koabiga.leaders.')->middleware(['auth', 'verified', 'role:unit_leader,zone_leader'])->group(function () {
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
    
    // Dynamic form route for specific form IDs
    Route::get('forms/{formId}', function ($formId) {
        return Inertia::render('koabiga/leaders/forms/dynamic-form', ['formId' => $formId]);
    })->name('forms.dynamic');
    
    Route::get('forms/member-creation', [\App\Http\Controllers\LeaderFormController::class, 'memberCreation'])->name('forms.member-creation');
    
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
