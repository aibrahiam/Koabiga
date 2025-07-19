<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
|
| This file contains the authentication routes for the Koabiga platform.
| All routes are properly secured and follow the role-based access control.
|
*/

// Guest routes (no authentication required)
Route::middleware('guest')->group(function () {
    
    // Welcome page - default landing page with member login form
    Route::get('/', function () {
        return Inertia::render('auth/welcome');
    })->name('home');

    // Admin Login Routes
    Route::get('/admin-login', [\App\Http\Controllers\Auth\AdminLoginController::class, 'create'])
        ->name('admin-login');

    Route::post('/admin/login', [\App\Http\Controllers\Auth\AdminLoginController::class, 'store'])
        ->name('admin.login');

    // Leaders Login Routes
    Route::get('/leaders-login', function () {
        return Inertia::render('auth/leaders-login');
    })->name('leaders-login');

    Route::post('/leaders/login', [AuthController::class, 'leaderLogin'])
        ->name('leaders.login');

    // Member Login Routes (handled on welcome page)
    Route::post('/member/login', [AuthController::class, 'memberLogin'])
        ->name('member.login');

    // Universal login route (redirects to welcome)
    Route::get('/login', function () {
        return redirect()->route('home');
    })->name('login');

    // Universal login POST (handles all roles)
    Route::post('/login', [AuthController::class, 'login'])
        ->name('login.post');
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    
    // Logout route
    Route::post('/logout', [AuthController::class, 'logout'])
        ->name('logout');

    // Password update (for authenticated users)
    Route::put('/password', [AuthController::class, 'updatePassword'])
        ->name('auth.password.update');
});

/*
|--------------------------------------------------------------------------
| Authentication Flow Summary
|--------------------------------------------------------------------------
|
| 1. Entry Point: / (Welcome Page)
|    - Shows member login form
|    - Links to admin and leader login pages
|    - Uses Inertia form submission
|
| 2. Admin Login: /admin-login
|    - Email + Password
|    - Redirects to /koabiga/admin/dashboard
|    - Uses Inertia form submission
|
| 3. Leader Login: /leaders-login
|    - Phone + PIN
|    - Redirects to /koabiga/leaders/dashboard
|    - Uses Inertia form submission
|
| 4. Member Login: / (Welcome Page)
|    - Phone + PIN
|    - Redirects to /koabiga/members/dashboard
|    - Uses Inertia form submission
|
| 5. No Public Registration
|    - Admins register Leaders and Members
|    - Leaders register Members
|    - No self-registration
|
| 6. No Password Reset
|    - All users are added by higher roles
|    - No email-based password reset
|    - Contact administrator for account issues
|
*/
