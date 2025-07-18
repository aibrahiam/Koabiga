<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminLoginController extends Controller
{
    /**
     * Display the admin login view.
     */
    public function create(): Response
    {
        return Inertia::render('auth/admin-login', [
            'canResetPassword' => false,
        ]);
    }

    /**
     * Handle an incoming admin authentication request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)
            ->where('role', 'admin')
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if user is active
        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Your account is not active. Please contact support.'],
            ]);
        }

        Auth::login($user, $request->boolean('remember'));

        $request->session()->regenerate();

        // Update last login timestamp
        $user->update([
            'last_login_at' => now(),
            'last_activity_at' => now(),
        ]);

        // Log the login activity
        ActivityLogService::logLogin($user);

        // Always redirect for Inertia requests
        return redirect()->intended('/koabiga/admin/dashboard');
    }

    /**
     * Destroy an authenticated admin session.
     */
    public function destroy(Request $request)
    {
        $user = Auth::user();
        
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Log the logout activity
        if ($user) {
            ActivityLogService::logLogout($user);
        }

        return redirect('/');
    }
} 