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

    Route::post('/leaders/login', [AuthController::class, 'leadersLogin'])
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

    // Password reset routes (disabled for this system - users added by admins)
    Route::get('/forgot-password', function () {
        return Inertia::render('auth/forgot-password');
    })->name('password.request');

    Route::post('/forgot-password', function () {
        return back()->with('status', 'Password reset is not available. Contact your administrator.');
    })->name('password.email');

    Route::get('/reset-password/{token}', function () {
        return redirect()->route('home')->with('error', 'Password reset is not available.');
    })->name('password.reset');

    Route::post('/reset-password', function () {
        return back()->with('error', 'Password reset is not available.');
    })->name('password.store');
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    
    // Logout route
    Route::post('/logout', [AuthController::class, 'logout'])
        ->name('logout');

    // Password confirmation (if needed for sensitive operations)
    Route::get('/confirm-password', function () {
        return Inertia::render('auth/confirm-password');
    })->name('password.confirm');

    Route::post('/confirm-password', [AuthController::class, 'confirmPassword'])
        ->name('password.confirm.post');

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
|
| 2. Admin Login: /admin-login
|    - Email + Password
|    - Redirects to /koabiga/admin/dashboard
|
| 3. Leader Login: /leaders-login
|    - Phone + PIN
|    - Redirects to /koabiga/leaders/dashboard
|
| 4. Member Login: / (Welcome Page)
|    - Phone + PIN
|    - Redirects to /koabiga/members/dashboard
|
| 5. No Public Registration
|    - Admins register Leaders and Members
|    - Leaders register Members
|    - No self-registration
|
| 6. No Email Verification
|    - All users are added by higher roles
|    - No email-based password reset
|
*/
