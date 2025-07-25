<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use App\Models\ActivityLog;
use App\Models\LoginSession;
use App\Models\User;

class SessionTimeoutMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Check if user is authenticated
        if (Auth::check()) {
            $user = Auth::user();
            $lastActivity = Session::get('last_activity');
            $timeout = config('session.lifetime', 15) * 60; // Convert to seconds (15 minutes)
            
            // Check if session has expired
            if ($lastActivity && (time() - $lastActivity) > $timeout) {
                // Log the timeout
                ActivityLog::create([
                    'user_id' => $user->id,
                    'action' => 'session_timeout',
                    'description' => 'Session expired due to inactivity',
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                ]);
                
                // Update login session status
                LoginSession::where('user_id', $user->id)
                    ->where('session_id', Session::getId())
                    ->update(['is_active' => false, 'logout_at' => now()]);
                
                // Logout user
                Auth::logout();
                Session::flush();
                
                if ($request->wantsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Session expired. Please login again.',
                        'code' => 'SESSION_EXPIRED'
                    ], 401);
                }
                
                return redirect()->route('login')->with('message', 'Session expired due to inactivity. Please login again.');
            }
            
            // Update last activity
            Session::put('last_activity', time());
            
            // Update user's last activity (only if it's been more than 5 minutes)
            $lastUserUpdate = Session::get('last_user_update');
            if (!$lastUserUpdate || (time() - $lastUserUpdate) > 300) { // 5 minutes
                User::where('id', $user->id)->update(['last_activity_at' => now()]);
                Session::put('last_user_update', time());
            }
            
            // Update login session (only if it's been more than 5 minutes)
            $lastSessionUpdate = Session::get('last_session_update');
            if (!$lastSessionUpdate || (time() - $lastSessionUpdate) > 300) { // 5 minutes
                LoginSession::where('user_id', $user->id)
                    ->where('session_id', Session::getId())
                    ->update(['last_activity_at' => now()]);
                Session::put('last_session_update', time());
            }
        }
        
        return $next($request);
    }
} 