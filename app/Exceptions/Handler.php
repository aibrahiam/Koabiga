<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        // Handle authentication exceptions
        $this->renderable(function (AuthenticationException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated. Please login to continue.',
                    'code' => 'UNAUTHENTICATED'
                ], 401);
            }

            // Log the unauthorized access attempt
            Log::warning('Unauthorized access attempt', [
                'url' => $request->fullUrl(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'referer' => $request->header('referer'),
            ]);

            // Redirect to custom unauthorized page for deep link access
            return Inertia::render('errors/unauthorized');
        });

        // Handle access denied exceptions
        $this->renderable(function (AccessDeniedHttpException $e, Request $request) {
            if ($request->expectsJson()) {
                return response()->json([
            'success' => false,
                    'message' => 'Access denied. You do not have permission to access this resource.',
                    'code' => 'ACCESS_DENIED'
                ], 403);
            }

            // Log the access denied attempt
            Log::warning('Access denied attempt', [
                'url' => $request->fullUrl(),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'user_id' => Auth::id(),
            ]);

            return Inertia::render('errors/unauthorized');
        });

        // Handle 403 Forbidden exceptions
        $this->renderable(function (HttpException $e, Request $request) {
            if ($e->getStatusCode() === 403) {
                if ($request->expectsJson()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Forbidden. You do not have permission to access this resource.',
                        'code' => 'FORBIDDEN'
                    ], 403);
                }

                // Log the forbidden access attempt
                Log::warning('Forbidden access attempt', [
                    'url' => $request->fullUrl(),
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent(),
                    'user_id' => Auth::id(),
                ]);

                return Inertia::render('errors/unauthorized');
            }
        });
    }
} 