<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash; // Added Hash facade
use App\Models\User;
use App\Models\ActivityLog;
use App\Models\LoginSession;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Handle admin login with email and password
     */
    public function adminLogin(Request $request): JsonResponse|RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ], [
            'email.required' => 'Email is required.',
            'email.email' => 'Please enter a valid email address.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 6 characters.',
        ]);

        if ($validator->fails()) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            return back()->withErrors($validator)->withInput();
        }

        $credentials = $request->only('email', 'password');
        $remember = $request->boolean('remember', false);

        // Use the authenticateAdmin method from User model
        $user = User::authenticateAdmin($credentials['email'], $credentials['password']);

        if (!$user) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials.'
                ], 401);
            }
            
            return back()->withErrors(['email' => 'Invalid credentials.'])->withInput();
        }

        // Log the user in (create session)
        Auth::login($user, $remember);
        
        // Regenerate session to prevent session fixation
        $request->session()->regenerate();
        
        // Set session timeout and security settings
        $request->session()->put('last_activity', time());
        $request->session()->put('login_time', time());
        $request->session()->put('user_id', $user->id);
        $request->session()->put('user_role', $user->role);
        
        // Ensure session is saved
        $request->session()->save();
        
        // Debug: Log session information
        Log::info('Admin login successful', [
            'user_id' => $user->id,
            'session_id' => $request->session()->getId(),
            'session_data' => $request->session()->all(),
        ]);

        // Create login session record
        LoginSession::create([
            'user_id' => $user->id,
            'session_id' => $request->session()->getId(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'is_active' => true,
            'login_at' => now(),
            'last_activity_at' => now(),
        ]);

        // Update last login
        User::where('id', $user->id)->update([
            'last_login_at' => now(),
            'last_activity_at' => now(),
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'description' => 'Admin logged in successfully',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // Return appropriate response based on request type
        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user' => [
                    'id' => $user->id,
                    'christian_name' => $user->christian_name,
                    'family_name' => $user->family_name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'phone' => $user->phone,
                ],
                'session_id' => $request->session()->getId(),
                'redirect_url' => '/koabiga/admin/dashboard'
            ]);
        }
        
        // For web requests, redirect to admin dashboard
        return redirect()->intended('/koabiga/admin/dashboard');
    }

    /**
     * Handle leaders login with phone and PIN
     */
    public function leadersLogin(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|numeric|digits_between:10,12',
            'pin' => 'required|numeric|digits:5',
        ], [
            'phone.required' => 'Phone number is required.',
            'phone.numeric' => 'Phone number must contain only digits.',
            'phone.digits_between' => 'Phone number must be between 10 and 12 digits.',
            'pin.required' => 'PIN is required.',
            'pin.numeric' => 'PIN must contain only digits.',
            'pin.digits' => 'PIN must be exactly 5 digits.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $phone = $request->input('phone');
        $pin = $request->input('pin');

        // Attempt to authenticate user
        $user = User::authenticateByPhoneAndPin($phone, $pin);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid phone number or PIN.'
            ], 401);
        }

        // Check if user is a leader (unit_leader or zone_leader)
        if (!in_array($user->role, ['unit_leader', 'zone_leader'])) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Leader privileges required.'
            ], 403);
        }

        // Log the user in (create session)
        Auth::login($user);
        
        // Regenerate session to prevent session fixation
        $request->session()->regenerate();
        
        // Set session timeout and security settings
        $request->session()->put('last_activity', time());
        $request->session()->put('login_time', time());
        $request->session()->put('user_id', $user->id);
        $request->session()->put('user_role', $user->role);
        
        // Ensure session is saved
        $request->session()->save();

        // Update last login
        User::where('id', $user->id)->update([
            'last_login_at' => now(),
            'last_activity_at' => now(),
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'description' => 'Leader logged in successfully',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'christian_name' => $user->christian_name,
                'family_name' => $user->family_name,
                'phone' => $user->phone,
                'role' => $user->role,
                'unit_id' => $user->unit_id,
                'zone_id' => $user->zone_id,
            ],
            'session_id' => $request->session()->getId()
        ]);
    }

    /**
     * Handle member/unit leader/zone leader login with phone and PIN
     */
    public function login(Request $request): JsonResponse|RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|numeric|digits_between:10,12',
            'pin' => 'required|numeric|digits:5',
        ], [
            'phone.required' => 'Phone number is required.',
            'phone.numeric' => 'Phone number must contain only digits.',
            'phone.digits_between' => 'Phone number must be between 10 and 12 digits.',
            'pin.required' => 'PIN is required.',
            'pin.numeric' => 'PIN must contain only digits.',
            'pin.digits' => 'PIN must be exactly 5 digits.',
        ]);

        if ($validator->fails()) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            return back()->withErrors($validator)->withInput();
        }

        $phone = $request->input('phone');
        $pin = $request->input('pin');

        // Attempt to authenticate member/unit leader/zone leader
        $user = User::authenticateByPhoneAndPin($phone, $pin);

        if ($user) {
                    // Log the user in (create session)
        Auth::login($user);
        
        // Regenerate session to prevent session fixation
        $request->session()->regenerate();
        
        // Set session timeout and security settings
        $request->session()->put('last_activity', time());
        $request->session()->put('login_time', time());
        $request->session()->put('user_id', $user->id);
        $request->session()->put('user_role', $user->role);
        
        // Ensure session is saved
        $request->session()->save();
            
            // Log successful login
            Log::info('User logged in successfully', [
                'user_id' => $user->id,
                'phone' => $user->phone,
                'role' => $user->role,
                'session_id' => $request->session()->getId(),
            ]);

            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Login successful',
                    'user' => [
                        'id' => $user->id,
                        'christian_name' => $user->christian_name,
                        'family_name' => $user->family_name,
                        'phone' => $user->phone,
                        'role' => $user->role,
                        'unit_id' => $user->unit_id,
                        'zone_id' => $user->zone_id,
                    ],
                ], 200);
            }

            // For Inertia requests, redirect based on role
            switch ($user->role) {
                case 'admin':
                    return redirect()->route('koabiga.admin.dashboard');
                case 'unit_leader':
                    return redirect()->route('koabiga.leaders.dashboard');
                case 'member':
                    return redirect()->route('koabiga.members.dashboard');
                default:
                    return redirect()->route('dashboard');
            }
        } else {
            // Log failed login attempt
            Log::warning('Failed login attempt', [
                'phone' => $phone,
                'ip' => $request->ip(),
            ]);
            
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'Invalid credentials'
                ], 401);
            }
            
            return back()->withErrors(['message' => 'Invalid credentials'])->withInput();
        }
    }

    /**
     * Handle user logout with proper session cleanup
     */
    public function logout(Request $request): JsonResponse|RedirectResponse
    {
        $user = Auth::user();
        
        if ($user) {
            // Log the logout activity
            ActivityLog::create([
                'user_id' => $user->id,
                'action' => 'logout',
                'description' => 'User logged out successfully',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            // Update login session status
            LoginSession::where('user_id', $user->id)
                ->where('session_id', $request->session()->getId())
                ->update(['is_active' => false, 'logout_at' => now()]);
        }

        // Clear all session data
        $request->session()->flush();
        
        // Logout the user
        Auth::logout();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);
        }

        return redirect()->route('home')->with('message', 'You have been logged out successfully.');
    }

    /**
     * Handle member login with phone and PIN
     */
    public function memberLogin(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|numeric|digits_between:10,12',
            'pin' => 'required|numeric|digits:5',
        ], [
            'phone.required' => 'Phone number is required.',
            'phone.numeric' => 'Phone number must contain only digits.',
            'phone.digits_between' => 'Phone number must be between 10 and 12 digits.',
            'pin.required' => 'PIN is required.',
            'pin.numeric' => 'PIN must contain only digits.',
            'pin.digits' => 'PIN must be exactly 5 digits.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $phone = $request->input('phone');
        $pin = $request->input('pin');

        // Attempt to authenticate member
        $user = User::authenticateByPhoneAndPin($phone, $pin);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid phone number or PIN.'
            ], 401);
        }

        // Check if user is a member
        if ($user->role !== 'member') {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Member privileges required.'
            ], 403);
        }

        // Log the user in (create session)
        Auth::login($user);
        
        // Regenerate session to prevent session fixation
        $request->session()->regenerate();
        
        // Set session timeout and security settings
        $request->session()->put('last_activity', time());
        $request->session()->put('login_time', time());
        $request->session()->put('user_id', $user->id);
        $request->session()->put('user_role', $user->role);
        
        // Ensure session is saved
        $request->session()->save();

        // Create login session record
        LoginSession::create([
            'user_id' => $user->id,
            'session_id' => $request->session()->getId(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'is_active' => true,
            'login_at' => now(),
            'last_activity_at' => now(),
        ]);

        // Update last login
        User::where('id', $user->id)->update([
            'last_login_at' => now(),
            'last_activity_at' => now(),
        ]);

        // Log activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'login',
            'description' => 'Member logged in successfully',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'christian_name' => $user->christian_name,
                'family_name' => $user->family_name,
                'phone' => $user->phone,
                'role' => $user->role,
                'unit_id' => $user->unit_id,
                'zone_id' => $user->zone_id,
            ],
            'session_id' => $request->session()->getId(),
            'redirect_url' => '/koabiga/members/dashboard'
        ]);
    }

    /**
     * Handle password confirmation for sensitive operations
     */
    public function confirmPassword(Request $request): JsonResponse|RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password is required.',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            return back()->withErrors($validator);
        }

        $user = Auth::user();
        
        if (!$user) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated.'
                ], 401);
            }
            
            return redirect()->route('login');
        }

        // Check password based on user role
        $isValid = false;
        
        if ($user->role === 'admin') {
            // Admin uses email/password
            $isValid = Hash::check($request->password, $user->password);
        } else {
            // Leaders and members use PIN
            $isValid = Hash::check($request->password, $user->pin);
        }

        if (!$isValid) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid password.'
                ], 401);
            }
            
            return back()->withErrors(['password' => 'Invalid password.']);
        }

        // Store password confirmation in session
        $request->session()->put('auth.password_confirmed_at', time());

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Password confirmed successfully.'
            ]);
        }

        return redirect()->intended();
    }

    /**
     * Handle password update for authenticated users
     */
    public function updatePassword(Request $request): JsonResponse|RedirectResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'current_password.required' => 'Current password is required.',
            'password.required' => 'New password is required.',
            'password.min' => 'New password must be at least 8 characters.',
            'password.confirmed' => 'Password confirmation does not match.',
        ]);

        if ($validator->fails()) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            return back()->withErrors($validator);
        }

        $user = Auth::user();
        
        if (!$user) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated.'
                ], 401);
            }
            
            return redirect()->route('login');
        }

        // Check current password based on user role
        $isValid = false;
        
        if ($user->role === 'admin') {
            // Admin uses email/password
            $isValid = Hash::check($request->current_password, $user->password);
        } else {
            // Leaders and members use PIN
            $isValid = Hash::check($request->current_password, $user->pin);
        }

        if (!$isValid) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect.'
                ], 401);
            }
            
            return back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        // Update password based on user role
        if ($user->role === 'admin') {
            User::where('id', $user->id)->update([
                'password' => Hash::make($request->password)
            ]);
        } else {
            User::where('id', $user->id)->update([
                'pin' => Hash::make($request->password)
            ]);
        }

        // Log activity
        ActivityLog::create([
            'user_id' => $user->id,
            'action' => 'password_update',
            'description' => 'User updated their password',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Password updated successfully.'
            ]);
        }

        return back()->with('status', 'Password updated successfully.');
    }
}
