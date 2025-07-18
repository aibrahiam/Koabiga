<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\ErrorLogService;
use Symfony\Component\HttpFoundation\Response;

class ErrorLoggingMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Start query logging
        DB::enableQueryLog();

        $response = $next($request);

        // Log slow queries
        $queries = DB::getQueryLog();
        foreach ($queries as $query) {
            if ($query['time'] > 1000) { // Log queries taking more than 1 second
                ErrorLogService::logWarning(
                    "Slow database query detected: {$query['time']}ms",
                    [
                        'type' => 'slow_query',
                        'sql' => $query['query'],
                        'bindings' => $query['bindings'],
                        'time' => $query['time'],
                        'connection' => $query['connection'] ?? 'default',
                    ]
                );
            }
        }

        // Log 4xx and 5xx errors
        if ($response->getStatusCode() >= 400) {
            $errorMessage = match ($response->getStatusCode()) {
                404 => 'Page not found',
                403 => 'Access forbidden',
                401 => 'Unauthorized access',
                500 => 'Internal server error',
                502 => 'Bad gateway',
                503 => 'Service unavailable',
                default => 'HTTP error ' . $response->getStatusCode(),
            };

            ErrorLogService::logError(
                new \Exception($errorMessage),
                [
                    'type' => 'http_error',
                    'status_code' => $response->getStatusCode(),
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'user_id' => $request->user()?->id,
                ]
            );
        }

        return $response;
    }
} 