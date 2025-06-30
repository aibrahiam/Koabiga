<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\AuthController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

// API route for testing (temporarily in web routes)
Route::post('/api/login', [AuthController::class, 'login']);

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    // Koabiga Admin Routes
    Route::prefix('koabiga/admin')->name('koabiga.admin.')->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('koabiga/admin/dashboard');
        })->name('dashboard');
        
        Route::get('members', function () {
            return Inertia::render('koabiga/admin/members');
        })->name('members');
        
        Route::get('units', function () {
            return Inertia::render('koabiga/admin/units');
        })->name('units');
        
        Route::get('reports', function () {
            return Inertia::render('koabiga/admin/reports');
        })->name('reports');
        
        Route::get('fee-rules', function () {
            return Inertia::render('koabiga/admin/fee-rules');
        })->name('fee-rules');
        
        Route::get('fee-rules/create', function () {
            return Inertia::render('koabiga/admin/fee-rules/create');
        })->name('fee-rules.create');
        
        Route::get('settings', function () {
            return Inertia::render('koabiga/admin/settings');
        })->name('settings');
        
        Route::get('forms', function () {
            return Inertia::render('koabiga/admin/forms');
        })->name('forms');
        
        Route::get('logs', function () {
            return Inertia::render('koabiga/admin/logs');
        })->name('logs');
        
        Route::get('page-management', function () {
            return Inertia::render('koabiga/admin/page-management');
        })->name('page-management');

        Route::get('members/create', function () {
            return Inertia::render('koabiga/admin/members/create');
        })->name('members.create');

        Route::get('members/{id}', function ($id) {
            return Inertia::render('koabiga/admin/members/[id]', ['id' => $id]);
        })->name('members.show');

        Route::get('members/{id}/edit', function ($id) {
            return Inertia::render('koabiga/admin/members/[id]/edit', ['id' => $id]);
        })->name('members.edit');

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
    });

    // Koabiga Unit Leader Routes
    Route::prefix('koabiga/unit-leader')->name('koabiga.unit-leader.')->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('koabiga/unit-leader/dashboard');
        })->name('dashboard');
        
        Route::get('members', function () {
            return Inertia::render('koabiga/unit-leader/members');
        })->name('members');
        
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
    });

    // Koabiga Member Routes
    Route::prefix('koabiga/member')->name('koabiga.member.')->group(function () {
        Route::get('dashboard', function () {
            return Inertia::render('koabiga/member/dashboard');
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
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
