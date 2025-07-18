<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ErrorLog;
use App\Services\ErrorLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ErrorLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ErrorLog::with('user:id,christian_name,family_name,email')
            ->orderBy('created_at', 'desc');

        // Filter by level
        if ($request->filled('level')) {
            $query->byLevel($request->level);
        }

        // Filter by resolved status
        if ($request->filled('resolved')) {
            if ($request->resolved === 'true') {
                $query->resolved();
            } else {
                $query->unresolved();
            }
        }

        // Search by message
        if ($request->filled('search')) {
            $query->where('message', 'like', '%' . $request->search . '%');
        }

        $errorLogs = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $errorLogs->items(),
            'pagination' => [
                'current_page' => $errorLogs->currentPage(),
                'last_page' => $errorLogs->lastPage(),
                'per_page' => $errorLogs->perPage(),
                'total' => $errorLogs->total(),
            ]
        ]);
    }

    public function statistics(): JsonResponse
    {
        $stats = ErrorLogService::getStatistics();

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $errorLog = ErrorLog::with(['user:id,christian_name,family_name,email', 'resolvedBy:id,christian_name,family_name'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $errorLog
        ]);
    }

    public function resolve(int $id): JsonResponse
    {
        $errorLog = ErrorLog::findOrFail($id);
        $success = $errorLog->markAsResolved(Auth::id());

        if ($success) {
            return response()->json([
                'success' => true,
                'message' => 'Error log marked as resolved',
                'data' => [
                    'id' => $id,
                    'resolved' => true,
                    'resolved_at' => $errorLog->resolved_at->toISOString(),
                    'resolved_by' => Auth::id(),
                ]
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Failed to mark error log as resolved'
        ], 500);
    }

    public function bulkResolve(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        
        if (empty($ids)) {
            return response()->json([
                'success' => false,
                'message' => 'No error log IDs provided'
            ], 400);
        }

        $resolvedCount = ErrorLog::whereIn('id', $ids)
            ->update([
                'resolved' => true,
                'resolved_at' => now(),
                'resolved_by' => Auth::id(),
            ]);

        return response()->json([
            'success' => true,
            'message' => $resolvedCount . ' error logs marked as resolved',
            'resolved_count' => $resolvedCount
        ]);
    }

    public function clearOldLogs(Request $request): JsonResponse
    {
        $days = $request->get('days', 30);
        
        $deletedCount = ErrorLogService::cleanupOldLogs($days);

        return response()->json([
            'success' => true,
            'message' => "Cleared old error logs older than {$days} days",
            'deleted_count' => $deletedCount
        ]);
    }
} 