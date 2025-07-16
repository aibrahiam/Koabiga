<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeeRule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class FeeRuleController extends Controller
{
    /**
     * Display a listing of fee rules.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = FeeRule::notDeleted();

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by type
            if ($request->has('type')) {
                $query->where('type', $request->type);
            }

            // Search by name
            if ($request->has('search')) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            // Sort by
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $feeRules = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $feeRules->items(),
                'pagination' => [
                    'current_page' => $feeRules->currentPage(),
                    'last_page' => $feeRules->lastPage(),
                    'per_page' => $feeRules->perPage(),
                    'total' => $feeRules->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch fee rules',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created fee rule.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'type' => ['required', Rule::in([
                    'land', 'equipment', 'processing', 'storage', 'training', 'other'
                ])],
                'amount' => 'required|numeric|min:0',
                'frequency' => ['required', Rule::in([
                    'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'per_transaction', 'one_time'
                ])],
                'unit' => 'required|string|max:255',
                'status' => ['required', Rule::in(['active', 'inactive', 'draft', 'scheduled'])],
                'applicable_to' => ['required', Rule::in([
                    'all_members', 'unit_leaders', 'new_members', 'active_members', 'specific_units'
                ])],
                'description' => 'required|string',
                'effective_date' => 'required|date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Determine initial status based on effective date
            $effectiveDate = $request->effective_date;
            $status = $request->status;
            
            if ($status === 'scheduled' || ($status === 'active' && $effectiveDate > now()->toDateString())) {
                $status = 'scheduled';
            }

            $feeRule = FeeRule::create([
                'name' => $request->name,
                'type' => $request->type,
                'amount' => $request->amount,
                'frequency' => $request->frequency,
                'unit' => $request->unit,
                'status' => $status,
                'applicable_to' => $request->applicable_to,
                'description' => $request->description,
                'effective_date' => $effectiveDate,
                'created_by' => Auth::user()?->name ?? 'System',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Fee rule created successfully',
                'data' => $feeRule
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create fee rule',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified fee rule.
     */
    public function show(FeeRule $feeRule): JsonResponse
    {
        try {
            if ($feeRule->is_deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee rule not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $feeRule
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch fee rule',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified fee rule.
     */
    public function update(Request $request, FeeRule $feeRule): JsonResponse
    {
        try {
            // Check if fee rule exists and is not null
            if (!$feeRule || $feeRule->is_deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee rule not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'type' => ['sometimes', 'required', Rule::in([
                    'land', 'equipment', 'processing', 'storage', 'training', 'other'
                ])],
                'amount' => 'sometimes|required|numeric|min:0',
                'frequency' => ['sometimes', 'required', Rule::in([
                    'daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'per_transaction', 'one_time'
                ])],
                'unit' => 'sometimes|required|string|max:255',
                'status' => ['sometimes', 'required', Rule::in(['active', 'inactive', 'draft', 'scheduled'])],
                'applicable_to' => ['sometimes', 'required', Rule::in([
                    'all_members', 'unit_leaders', 'new_members', 'active_members', 'specific_units'
                ])],
                'description' => 'sometimes|required|string',
                'effective_date' => 'sometimes|required|date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Determine status based on effective date if status is being updated
            if ($request->has('status') || $request->has('effective_date')) {
                $effectiveDate = $request->effective_date ?? $feeRule->effective_date;
                $status = $request->status ?? ($feeRule->status ?? 'active');
                
                if ($status === 'scheduled' || ($status === 'active' && $effectiveDate > now()->toDateString())) {
                    $status = 'scheduled';
                }
                
                $request->merge(['status' => $status]);
            }

            $feeRule->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Fee rule updated successfully',
                'data' => $feeRule->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update fee rule',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified fee rule.
     */
    public function destroy(FeeRule $feeRule): JsonResponse
    {
        try {
            if ($feeRule->is_deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee rule not found'
                ], 404);
            }

            // Soft delete
            $feeRule->delete();

            return response()->json([
                'success' => true,
                'message' => 'Fee rule deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete fee rule',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activate scheduled fee rules (for background job).
     */
    public function activateScheduledRules(): JsonResponse
    {
        try {
            $scheduledRules = FeeRule::scheduled()
                ->effectiveDateReached()
                ->notDeleted()
                ->get();

            $activatedCount = 0;
            foreach ($scheduledRules as $rule) {
                if ($rule->activate()) {
                    $activatedCount++;
                }
            }

            return response()->json([
                'success' => true,
                'message' => "Activated {$activatedCount} scheduled fee rules",
                'activated_count' => $activatedCount
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to activate scheduled rules',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get fee rule statistics
     */
    public function statistics(): JsonResponse
    {
        try {
            $stats = [
                'total_rules' => FeeRule::notDeleted()->count(),
                'active_rules' => FeeRule::active()->notDeleted()->count(),
                'scheduled_rules' => FeeRule::scheduled()->notDeleted()->count(),
                'inactive_rules' => FeeRule::where('status', 'inactive')->notDeleted()->count(),
                'total_applications' => \App\Models\FeeApplication::count(),
                'pending_applications' => \App\Models\FeeApplication::pending()->count(),
                'overdue_applications' => \App\Models\FeeApplication::overdue()->count(),
                'paid_applications' => \App\Models\FeeApplication::paid()->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch fee rule statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Apply fee rule to users
     */
    public function applyFeeRule(Request $request, FeeRule $feeRule): JsonResponse
    {
        try {
            Log::info('Applying fee rule', [
                'fee_rule_id' => $feeRule->id,
                'fee_rule_name' => $feeRule->name,
                'status' => $feeRule->status,
                'effective_date' => $feeRule->effective_date,
                'applicable_to' => $feeRule->applicable_to,
                'user_id' => Auth::id(),
                'user_role' => Auth::user()?->role,
                'is_authenticated' => Auth::check()
            ]);

            // Check if user is authenticated
            if (!Auth::check()) {
                Log::warning('Unauthenticated user attempted to apply fee rule', [
                    'fee_rule_id' => $feeRule->id,
                    'ip' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required'
                ], 401);
            }

            // Check if user has admin role
            if (Auth::user()->role !== 'admin') {
                Log::warning('Non-admin user attempted to apply fee rule', [
                    'fee_rule_id' => $feeRule->id,
                    'user_id' => Auth::id(),
                    'user_role' => Auth::user()->role
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Admin access required'
                ], 403);
            }

            // Check if fee rule is active
            if ($feeRule->status !== 'active') {
                Log::warning('Attempted to apply inactive fee rule', [
                    'fee_rule_id' => $feeRule->id,
                    'status' => $feeRule->status,
                    'user_id' => Auth::id()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Only active fee rules can be applied'
                ], 400);
            }

            // Check if effective date has been reached
            if ($feeRule->effective_date > now()->toDateString()) {
                Log::warning('Attempted to apply fee rule before effective date', [
                    'fee_rule_id' => $feeRule->id,
                    'effective_date' => $feeRule->effective_date,
                    'current_date' => now()->toDateString(),
                    'user_id' => Auth::id()
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Fee rule effective date has not been reached yet'
                ], 400);
            }

            $feeService = new \App\Services\FeeSchedulingService();
            Log::info('FeeSchedulingService instantiated successfully');

            $result = $feeService->applyFeeRule($feeRule);
            Log::info('Fee rule application completed', [
                'fee_rule_id' => $feeRule->id,
                'result' => $result,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'message' => "Fee rule applied successfully",
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('Error applying fee rule: ' . $e->getMessage(), [
                'fee_rule_id' => $feeRule->id ?? 'unknown',
                'user_id' => Auth::id(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to apply fee rule: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getMessage() : 'An error occurred while applying the fee rule'
            ], 500);
        }
    }

    /**
     * Schedule fee rule
     */
    public function scheduleFeeRule(Request $request, FeeRule $feeRule): JsonResponse
    {
        try {
            $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
                'effective_date' => 'required|date|after:today',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $feeService = new \App\Services\FeeSchedulingService();
            $success = $feeService->scheduleFeeRule($feeRule, $request->effective_date);

            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => 'Fee rule scheduled successfully',
                    'data' => $feeRule->fresh()
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to schedule fee rule'
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to schedule fee rule',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign fee rule to units
     */
    public function assignToUnits(Request $request, FeeRule $feeRule): JsonResponse
    {
        try {
            $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
                'unit_ids' => 'required|array',
                'unit_ids.*' => 'exists:units,id',
                'custom_amounts' => 'sometimes|array',
                'custom_amounts.*' => 'numeric|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $feeService = new \App\Services\FeeSchedulingService();
            $result = $feeService->assignFeeRuleToUnits(
                $feeRule, 
                $request->unit_ids, 
                $request->custom_amounts ?? []
            );

            return response()->json([
                'success' => true,
                'message' => "Fee rule assigned to {$result['assigned_count']} units",
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign fee rule to units',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get fee applications for a fee rule
     */
    public function getFeeApplications(Request $request, FeeRule $feeRule): JsonResponse
    {
        try {
            $query = $feeRule->feeApplications()->with(['user:id,christian_name,family_name,phone', 'unit:id,name']);

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            // Filter by unit
            if ($request->has('unit_id')) {
                $query->where('unit_id', $request->unit_id);
            }

            // Search by user name
            if ($request->has('search')) {
                $query->whereHas('user', function($q) use ($request) {
                    $q->where('christian_name', 'like', '%' . $request->search . '%')
                      ->orWhere('family_name', 'like', '%' . $request->search . '%');
                });
            }

            $applications = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $applications->items(),
                'pagination' => [
                    'current_page' => $applications->currentPage(),
                    'last_page' => $applications->lastPage(),
                    'per_page' => $applications->perPage(),
                    'total' => $applications->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch fee applications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get unit assignments for a fee rule
     */
    public function getUnitAssignments(FeeRule $feeRule): JsonResponse
    {
        try {
            $assignments = $feeRule->unitAssignments()
                ->with('unit:id,name,zone_id')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $assignments
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch unit assignments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get statistics for a specific fee rule
     */
    public function getFeeRuleStatistics(FeeRule $feeRule): JsonResponse
    {
        try {
            if ($feeRule->is_deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Fee rule not found'
                ], 404);
            }

            $applications = $feeRule->feeApplications();

            $stats = [
                'total_applications' => $applications->count(),
                'pending_applications' => $applications->where('status', 'pending')->count(),
                'overdue_applications' => $applications->where('status', 'overdue')->count(),
                'paid_applications' => $applications->where('status', 'paid')->count(),
                'total_amount_due' => $applications->whereIn('status', ['pending', 'overdue'])->sum('amount'),
                'total_amount_paid' => $applications->where('status', 'paid')->sum('amount'),
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch fee rule statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
