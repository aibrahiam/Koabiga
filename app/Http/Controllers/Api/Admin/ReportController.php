<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Models\Report;
use App\Models\User;

class ReportController extends Controller
{
    /**
     * Get all reports with filtering
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ], 403);
            }

            $query = Report::with(['user', 'createdBy']);

            // Apply search filter
            if ($request->has('search') && $request->search) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Apply type filter
            if ($request->has('type') && $request->type !== 'all') {
                $query->where('type', $request->type);
            }

            // Apply category filter
            if ($request->has('category') && $request->category !== 'all') {
                $query->where('category', $request->category);
            }

            // Apply status filter
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            $reports = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => $reports
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch reports: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate a new report
     */
    public function generate(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ], 403);
            }

            $validated = $request->validate([
                'title' => 'required|string|max:255',
                'type' => 'required|string|in:activity,financial,production,performance',
                'category' => 'required|string|in:member,financial,crop,unit',
                'description' => 'nullable|string',
                'schedule' => 'nullable|string|in:daily,weekly,monthly,quarterly,yearly',
            ]);

            $report = Report::create([
                'title' => $validated['title'],
                'type' => $validated['type'],
                'category' => $validated['category'],
                'description' => $validated['description'],
                'status' => 'active',
                'created_by' => $user->id,
                'schedule' => $validated['schedule'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Report generated successfully',
                'data' => $report
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get report statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ], 403);
            }

            $stats = [
                'totalReports' => Report::count(),
                'activeReports' => Report::where('status', 'active')->count(),
                'draftReports' => Report::where('status', 'draft')->count(),
                'scheduledReports' => Report::whereNotNull('schedule')->count(),
                'reportsByType' => [
                    'activity' => Report::where('type', 'activity')->count(),
                    'financial' => Report::where('type', 'financial')->count(),
                    'production' => Report::where('type', 'production')->count(),
                    'performance' => Report::where('type', 'performance')->count(),
                ],
                'reportsByCategory' => [
                    'member' => Report::where('category', 'member')->count(),
                    'financial' => Report::where('category', 'financial')->count(),
                    'crop' => Report::where('category', 'crop')->count(),
                    'unit' => Report::where('category', 'unit')->count(),
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch report statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update report status
     */
    public function updateStatus(Request $request, $id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ], 403);
            }

            $validated = $request->validate([
                'status' => 'required|string|in:active,draft,inactive',
            ]);

            $report = Report::findOrFail($id);
            $report->update([
                'status' => $validated['status'],
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Report status updated successfully',
                'data' => $report
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update report status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a report
     */
    public function destroy($id): JsonResponse
    {
        try {
            $user = Auth::user();
            
            if (!$user || $user->role !== 'admin') {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. Admin privileges required.'
                ], 403);
            }

            $report = Report::findOrFail($id);
            $report->delete();

            return response()->json([
                'success' => true,
                'message' => 'Report deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete report: ' . $e->getMessage()
            ], 500);
        }
    }
}
