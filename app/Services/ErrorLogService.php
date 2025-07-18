<?php

namespace App\Services;

use App\Models\ErrorLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class ErrorLogService
{
    /**
     * Log a system error
     */
    public static function logError(Throwable $exception, $context = [], $userId = null)
    {
        try {
            $userId = $userId ?? Auth::id();
            
            ErrorLog::create([
                'user_id' => $userId,
                'level' => 'error',
                'message' => $exception->getMessage(),
                'stack_trace' => $exception->getTraceAsString(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'context' => array_merge($context, [
                    'url' => Request::fullUrl(),
                    'method' => Request::method(),
                    'ip_address' => Request::ip(),
                    'user_agent' => Request::userAgent(),
                    'timestamp' => now()->toISOString(),
                    'exception_class' => get_class($exception),
                    'exception_code' => $exception->getCode(),
                ]),
                'resolved' => false,
            ]);

            // Also log to Laravel's default log system
            Log::error('System error logged', [
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'user_id' => $userId,
            ]);

        } catch (\Exception $e) {
            // Fallback to Laravel's default logging if our error logging fails
            Log::error('Failed to log error to database', [
                'original_error' => $exception->getMessage(),
                'logging_error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Log a warning
     */
    public static function logWarning($message, $context = [], $userId = null)
    {
        try {
            $userId = $userId ?? Auth::id();
            
            ErrorLog::create([
                'user_id' => $userId,
                'level' => 'warning',
                'message' => $message,
                'stack_trace' => null,
                'file' => null,
                'line' => null,
                'context' => array_merge($context, [
                    'url' => Request::fullUrl(),
                    'method' => Request::method(),
                    'ip_address' => Request::ip(),
                    'user_agent' => Request::userAgent(),
                    'timestamp' => now()->toISOString(),
                ]),
                'resolved' => false,
            ]);

        } catch (\Exception $e) {
            Log::warning('Failed to log warning to database', [
                'original_message' => $message,
                'logging_error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Log an info message
     */
    public static function logInfo($message, $context = [], $userId = null)
    {
        try {
            $userId = $userId ?? Auth::id();
            
            ErrorLog::create([
                'user_id' => $userId,
                'level' => 'info',
                'message' => $message,
                'stack_trace' => null,
                'file' => null,
                'line' => null,
                'context' => array_merge($context, [
                    'url' => Request::fullUrl(),
                    'method' => Request::method(),
                    'ip_address' => Request::ip(),
                    'user_agent' => Request::userAgent(),
                    'timestamp' => now()->toISOString(),
                ]),
                'resolved' => false,
            ]);

        } catch (\Exception $e) {
            Log::info('Failed to log info to database', [
                'original_message' => $message,
                'logging_error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Log database errors
     */
    public static function logDatabaseError($message, $query = null, $bindings = [], $userId = null)
    {
        $context = [
            'type' => 'database_error',
            'query' => $query,
            'bindings' => $bindings,
        ];

        self::logError(new \Exception($message), $context, $userId);
    }

    /**
     * Log authentication errors
     */
    public static function logAuthError($message, $credentials = [], $userId = null)
    {
        $context = [
            'type' => 'authentication_error',
            'credentials' => array_keys($credentials), // Don't log actual values for security
        ];

        self::logError(new \Exception($message), $context, $userId);
    }

    /**
     * Log validation errors
     */
    public static function logValidationError($message, $errors = [], $userId = null)
    {
        $context = [
            'type' => 'validation_error',
            'errors' => $errors,
        ];

        self::logError(new \Exception($message), $context, $userId);
    }

    /**
     * Log API errors
     */
    public static function logApiError($message, $endpoint = null, $response = null, $userId = null)
    {
        $context = [
            'type' => 'api_error',
            'endpoint' => $endpoint,
            'response_code' => $response['code'] ?? null,
            'response_body' => $response['body'] ?? null,
        ];

        self::logError(new \Exception($message), $context, $userId);
    }

    /**
     * Get error statistics
     */
    public static function getStatistics()
    {
        return [
            'total_errors' => ErrorLog::count(),
            'errors_today' => ErrorLog::whereDate('created_at', today())->count(),
            'errors_this_week' => ErrorLog::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'errors_this_month' => ErrorLog::whereMonth('created_at', now()->month)->count(),
            'unresolved_errors' => ErrorLog::unresolved()->count(),
            'error_levels' => [
                'error' => ErrorLog::byLevel('error')->count(),
                'warning' => ErrorLog::byLevel('warning')->count(),
                'info' => ErrorLog::byLevel('info')->count(),
            ],
        ];
    }

    /**
     * Clean up old error logs
     */
    public static function cleanupOldLogs($days = 30)
    {
        $cutoffDate = now()->subDays($days);
        $deletedCount = ErrorLog::where('created_at', '<', $cutoffDate)->delete();
        
        Log::info("Cleaned up {$deletedCount} old error logs older than {$days} days");
        
        return $deletedCount;
    }
} 