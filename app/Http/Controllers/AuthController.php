<?php

namespace App\Http\Controllers;

use App\Helpers\PasswordHelper;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Show admin login form
     */
    public function showAdminLogin()
    {
        return Inertia::render('auth/admin-login');
    }

    /**
     * Handle admin login
     */
    public function adminLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::authenticateByEmail($request->email, $request->password);

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->isActive()) {
            throw ValidationException::withMessages([
                'email' => ['Your account is not active.'],
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended('/koabiga/admin/dashboard');
    }

    /**
     * Show leader login form
     */
    public function showLeaderLogin()
    {
        return Inertia::render('auth/leader-login');
    }

    /**
     * Handle leader login
     */
    public function leaderLogin(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'pin' => 'required|string|size:5',
        ]);

        $user = User::authenticateByPhone($request->phone, $request->pin);

        if (!$user) {
            throw ValidationException::withMessages([
                'phone' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->isActive()) {
            throw ValidationException::withMessages([
                'phone' => ['Your account is not active.'],
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();
        
        return redirect()->intended('/koabiga/leaders/dashboard');
    }

    /**
     * Show member login form
     */
    public function showMemberLogin()
    {
        return Inertia::render('auth/member-login');
    }

    /**
     * Handle member login
     */
    public function memberLogin(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'pin' => 'required|string|size:5',
        ]);

        $user = User::authenticateByPhone($request->phone, $request->pin);

        if (!$user) {
            throw ValidationException::withMessages([
                'phone' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->isActive()) {
            throw ValidationException::withMessages([
                'phone' => ['Your account is not active.'],
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();
        
        return redirect()->intended('/koabiga/members/dashboard');
    }

    /**
     * Show general login form (redirects based on role)
     */
    public function showLogin()
    {
        return Inertia::render('auth/login');
    }

    /**
     * Handle general login (legacy support)
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required_without:phone|email',
            'phone' => 'required_without:email|string',
            'password' => 'required_with:email|string',
            'pin' => 'required_with:phone|string|size:5',
        ]);

        $user = null;

        // Try email/password login first
        if ($request->email && $request->password) {
            $user = User::authenticateByEmail($request->email, $request->password);
        }
        // Try phone/PIN login
        elseif ($request->phone && $request->pin) {
            $user = User::authenticateByPhone($request->phone, $request->pin);
        }

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->isActive()) {
            throw ValidationException::withMessages([
                'email' => ['Your account is not active.'],
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();
        
        // Redirect based on role
        if ($user->isAdmin()) {
            return redirect()->intended('/koabiga/admin/dashboard');
        } elseif ($user->isUnitLeader()) {
            return redirect()->intended('/koabiga/leaders/dashboard');
        } else {
            return redirect()->intended('/koabiga/members/dashboard');
        }
    }

    /**
     * Handle logout
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Update user password
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();
        
        // Verify current password
        if (!PasswordHelper::verifyPassword($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match your current password.'],
            ]);
        }

        // Validate password strength
        if (!PasswordHelper::validatePasswordStrength($request->password)) {
            throw ValidationException::withMessages([
                'password' => ['Password must be at least 8 characters with uppercase, lowercase, and number.'],
            ]);
        }

        User::where('id', $user->id)->update(['password' => $request->password]);

        return back()->with('success', 'Password updated successfully.');
    }

    /**
     * Update user PIN
     */
    public function updatePin(Request $request)
    {
        $request->validate([
            'current_pin' => 'required|string|size:5',
            'pin' => 'required|string|size:5|confirmed',
        ]);

        $user = Auth::user();
        
        // Only allow PIN updates for phone login users
        if (!PasswordHelper::canUsePhoneLogin($user->role)) {
            throw ValidationException::withMessages([
                'pin' => ['PIN updates are not allowed for this user type.'],
            ]);
        }

        // Verify current PIN
        if (!PasswordHelper::verifyPin($request->current_pin, $user->pin)) {
            throw ValidationException::withMessages([
                'current_pin' => ['The provided PIN does not match your current PIN.'],
            ]);
        }

        // Validate PIN format
        if (!PasswordHelper::validatePinFormat($request->pin)) {
            throw ValidationException::withMessages([
                'pin' => ['PIN must be exactly 5 digits.'],
            ]);
        }

        User::where('id', $user->id)->update(['pin' => $request->pin]);

        return back()->with('success', 'PIN updated successfully.');
    }

    /**
     * Generate new PIN for user
     */
    public function generateNewPin(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $user = User::findOrFail($request->user_id);
        
        // Only allow PIN generation for phone login users
        if (!PasswordHelper::canUsePhoneLogin($user->role)) {
            return back()->with('error', 'PIN generation is not allowed for this user type.');
        }

        $newPin = PasswordHelper::generatePin();
        User::where('id', $user->id)->update(['pin' => $newPin]);

        return back()->with('success', "New PIN generated: {$newPin}");
    }
}
