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
    
    // Generate unit code
    Route::post('units/generate-code', [\App\Http\Controllers\UnitController::class, 'generateCode'])->name('units.generate-code');



    Route::get('units/{unit}/members', [\App\Http\Controllers\UnitController::class, 'members'])->name('units.members');
    
    // Reports Management
    Route::get('reports', function () {
        return Inertia::render('koabiga/admin/reports/reports');
    })->name('reports');
    
    Route::get('reports/generate-report', function () {
        return Inertia::render('koabiga/admin/reports/generate-report');
    })->name('reports.generate');
    
    // Fee Rules Management
    Route::resource('fee-rules', \App\Http\Controllers\Admin\FeeRuleController::class)->names([
        'index' => 'fee-rules.index',
        'create' => 'fee-rules.create',
        'store' => 'fee-rules.store',
        'show' => 'fee-rules.show',
        'edit' => 'fee-rules.edit',
        'update' => 'fee-rules.update',
        'destroy' => 'fee-rules.destroy',
    ]);
    
    // Fee Rules Actions
    Route::post('fee-rules/{feeRule}/apply', [\App\Http\Controllers\Admin\FeeRuleController::class, 'applyFeeRule'])->name('fee-rules.apply');
    Route::post('fee-rules/{feeRule}/schedule', [\App\Http\Controllers\Admin\FeeRuleController::class, 'scheduleFeeRule'])->name('fee-rules.schedule');
    Route::post('fee-rules/{feeRule}/assign-units', [\App\Http\Controllers\Admin\FeeRuleController::class, 'assignToUnits'])->name('fee-rules.assign-units');
    
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
    Route::get('page-management', [App\Http\Controllers\Admin\PageController::class, 'index'])->name('page-management');
    Route::get('pages/create', [App\Http\Controllers\Admin\PageController::class, 'create'])->name('pages.create');
    Route::get('pages/{page}/edit', [App\Http\Controllers\Admin\PageController::class, 'edit'])->name('pages.edit');
    Route::get('pages/navigation/{role}/preview', [App\Http\Controllers\Admin\PageController::class, 'getNavigationPreview'])->name('pages.navigation.preview');
    Route::get('pages/stats', [App\Http\Controllers\Admin\PageController::class, 'getStats'])->name('pages.stats');
    
    // Page CRUD operations
    Route::post('pages', [App\Http\Controllers\Admin\PageController::class, 'store'])->name('pages.store');
    Route::put('pages/{page}', [App\Http\Controllers\Admin\PageController::class, 'update'])->name('pages.update');
    Route::delete('pages/{page}', [App\Http\Controllers\Admin\PageController::class, 'destroy'])->name('pages.destroy');

    // Member Management CRUD operations
    Route::put('members/{member}', [App\Http\Controllers\Admin\MemberController::class, 'update'])->name('members.update');

    Route::get('pages/{id}/edit', function ($id) {
        return Inertia::render('koabiga/admin/pages/edit-page', ['id' => $id]);
    })->name('pages.edit');

    // System Monitoring
    Route::get('logs', function () {
        // Calculate system log statistics
        $stats = [
            'total_activity_logs' => \App\Models\ActivityLog::count(),
            'total_error_logs' => \App\Models\ErrorLog::count(),
            'total_login_sessions' => \App\Models\LoginSession::count(),
            'today_activity_logs' => \App\Models\ActivityLog::whereDate('created_at', today())->count(),
            'today_error_logs' => \App\Models\ErrorLog::whereDate('created_at', today())->count(),
            'today_login_sessions' => \App\Models\LoginSession::whereDate('created_at', today())->count(),
            'unique_users' => \App\Models\ActivityLog::whereNotNull('user_id')->distinct('user_id')->count(),
            'system_health' => 'good', // This could be calculated based on error rates
        ];

        return Inertia::render('koabiga/admin/system-log/logs', [
            'stats' => $stats,
        ]);
    })->name('logs');

    Route::get('activity-logs', function () {
        $query = \App\Models\ActivityLog::with('user:id,christian_name,family_name,email,role')
            ->orderBy('created_at', 'desc');

        // Get paginated results
        $activityLogs = $query->paginate(50);

        // Calculate statistics
        $stats = [
            'total_logs' => \App\Models\ActivityLog::count(),
            'today_logs' => \App\Models\ActivityLog::whereDate('created_at', today())->count(),
            'this_week_logs' => \App\Models\ActivityLog::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'this_month_logs' => \App\Models\ActivityLog::whereMonth('created_at', now()->month)->count(),
            'unique_users' => \App\Models\ActivityLog::whereNotNull('user_id')->distinct('user_id')->count(),
        ];

        return Inertia::render('koabiga/admin/system-log/activity-logs', [
            'activityLogs' => $activityLogs->items(),
            'stats' => $stats,
            'pagination' => [
                'current_page' => $activityLogs->currentPage(),
                'last_page' => $activityLogs->lastPage(),
                'per_page' => $activityLogs->perPage(),
                'total' => $activityLogs->total(),
            ],
        ]);
    })->name('activity-logs');

    // Error Logs
    Route::get('error-logs', [\App\Http\Controllers\Admin\ErrorLogController::class, 'index'])->name('error-logs');
    Route::get('error-logs/{errorLog}', [\App\Http\Controllers\Admin\ErrorLogController::class, 'show'])->name('error-logs.show');
    Route::post('error-logs/{errorLog}/resolve', [\App\Http\Controllers\Admin\ErrorLogController::class, 'resolve'])->name('error-logs.resolve');
    Route::post('error-logs/bulk-resolve', [\App\Http\Controllers\Admin\ErrorLogController::class, 'bulkResolve'])->name('error-logs.bulk-resolve');
    Route::post('error-logs/clear-old', [\App\Http\Controllers\Admin\ErrorLogController::class, 'clearOldLogs'])->name('error-logs.clear-old');



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
        $user = \Illuminate\Support\Facades\Auth::user();
        
        // Get fee applications for the current user
        $feeApplications = \App\Models\FeeApplication::where('user_id', $user->id)
            ->with(['feeRule:id,name,type,description'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate stats
        $stats = [
            'total_fees' => $feeApplications->count(),
            'paid_fees' => $feeApplications->where('status', 'paid')->count(),
            'pending_fees' => $feeApplications->where('status', 'pending')->count(),
            'overdue_fees' => $feeApplications->where('status', 'overdue')->count(),
            'total_amount' => $feeApplications->sum('amount'),
            'paid_amount' => $feeApplications->where('status', 'paid')->sum('amount'),
            'pending_amount' => $feeApplications->where('status', 'pending')->sum('amount'),
            'overdue_amount' => $feeApplications->where('status', 'overdue')->sum('amount'),
        ];

        return Inertia::render('koabiga/member/fees', [
            'feeApplications' => $feeApplications,
            'stats' => $stats,
        ]);
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
    
    Route::get('fees', function () {
        $user = \Illuminate\Support\Facades\Auth::user();
        
        // Get fee applications for the current leader
        $feeApplications = \App\Models\FeeApplication::where('user_id', $user->id)
            ->with(['feeRule:id,name,type,description'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Calculate stats
        $stats = [
            'total_fees' => $feeApplications->count(),
            'paid_fees' => $feeApplications->where('status', 'paid')->count(),
            'pending_fees' => $feeApplications->where('status', 'pending')->count(),
            'overdue_fees' => $feeApplications->where('status', 'overdue')->count(),
            'total_amount' => $feeApplications->sum('amount'),
            'paid_amount' => $feeApplications->where('status', 'paid')->sum('amount'),
            'pending_amount' => $feeApplications->where('status', 'pending')->sum('amount'),
            'overdue_amount' => $feeApplications->where('status', 'overdue')->sum('amount'),
        ];

        return Inertia::render('koabiga/leaders/fees', [
            'feeApplications' => $feeApplications,
            'stats' => $stats,
        ]);
    })->name('fees');
});



require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
