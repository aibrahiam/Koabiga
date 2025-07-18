<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ErrorLog;
use App\Services\ErrorLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ErrorLogController extends Controller
{
    public function index(Request $request): Response
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

        $errorLogs = $query->paginate(50);

        // Get statistics
        $stats = ErrorLogService::getStatistics();

        return Inertia::render('koabiga/admin/system-log/error-logs', [
            'errorLogs' => $errorLogs->items(),
            'stats' => $stats,
            'pagination' => [
                'current_page' => $errorLogs->currentPage(),
                'last_page' => $errorLogs->lastPage(),
                'per_page' => $errorLogs->perPage(),
                'total' => $errorLogs->total(),
            ],
            'filters' => $request->only(['level', 'resolved', 'search']),
        ]);
    }

    public function show(ErrorLog $errorLog): Response
    {
        $errorLog->load(['user:id,christian_name,family_name,email', 'resolvedBy:id,christian_name,family_name']);

        return Inertia::render('koabiga/admin/system-log/error-detail', [
            'errorLog' => $errorLog,
        ]);
    }

    public function resolve(ErrorLog $errorLog)
    {
        $success = $errorLog->markAsResolved(Auth::id());

        if ($success) {
            return back()->with('success', 'Error log marked as resolved');
        }

        return back()->with('error', 'Failed to mark error log as resolved');
    }

    public function bulkResolve(Request $request)
    {
        $ids = $request->input('ids', []);
        
        if (empty($ids)) {
            return back()->with('error', 'No error log IDs provided');
        }

        $resolvedCount = ErrorLog::whereIn('id', $ids)
            ->update([
                'resolved' => true,
                'resolved_at' => now(),
                'resolved_by' => Auth::id(),
            ]);

        return back()->with('success', "{$resolvedCount} error logs marked as resolved");
    }

    public function clearOldLogs(Request $request)
    {
        $days = $request->get('days', 30);
        
        $deletedCount = ErrorLogService::cleanupOldLogs($days);

        return back()->with('success', "Cleared {$deletedCount} old error logs older than {$days} days");
    }
} 