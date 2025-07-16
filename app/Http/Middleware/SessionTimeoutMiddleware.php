<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use App\Models\ActivityLog;
use App\Models\LoginSession;

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
            
            // Update user's last activity
            \App\Models\User::where('id', $user->id)->update(['last_activity_at' => now()]);
            
            // Update login session
            LoginSession::where('user_id', $user->id)
                ->where('session_id', Session::getId())
                ->update(['last_activity_at' => now()]);
        }
        
        return $next($request);
    }
} 