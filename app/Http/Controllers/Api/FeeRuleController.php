<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeeRule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

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
                'created_by' => auth()->user()?->name ?? 'System',
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
            if ($feeRule->is_deleted) {
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
                $status = $request->status ?? $feeRule->status;
                
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
}
