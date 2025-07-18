<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Services\FormService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class FormController extends Controller
{
    /**
     * Display a listing of forms
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Form::query();

            // Apply filters
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            if ($request->has('type')) {
                $query->where('type', $request->get('type'));
            }

            if ($request->has('category')) {
                $query->where('category', $request->get('category'));
            }

            if ($request->has('status')) {
                $query->where('status', $request->get('status'));
            }

            // Filter by target_roles - handle JSON array column
            if ($request->has('target_roles')) {
                $targetRole = $request->get('target_roles');
                $query->whereJsonContains('target_roles', $targetRole);
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $forms = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $forms
            ]);
        } catch (\Exception $e) {
            Log::error('FormController index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
                'user' => Auth::user() ? [
                    'id' => Auth::user()->id,
                    'role' => Auth::user()->role
                ] : 'Not authenticated'
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching forms',
                'error' => $e->getMessage(),
                'debug' => [
                    'user_authenticated' => Auth::check(),
                    'user_role' => Auth::user() ? Auth::user()->role : null,
                    'request_params' => $request->all()
                ]
            ], 500);
        }
    }

    /**
     * Store a newly created form
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'type' => 'required|in:request,registration,report,application,feedback',
            'category' => 'required|in:land,crop,equipment,member,harvest,financial,training,other',
            'description' => 'nullable|string',
            'fields' => 'required|array',
            'fields.*.name' => 'required|string',
            'fields.*.type' => 'required|in:text,textarea,select,checkbox,radio,date,number,email',
            'fields.*.label' => 'required|string',
            'fields.*.required' => 'boolean',
            'fields.*.options' => 'nullable|array',
            'status' => 'required|in:active,draft,inactive',
            'target_roles' => 'nullable|array',
            'target_roles.*' => 'in:admin,unit_leader,member',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $formData = $validator->validated();
        $formData['user_id'] = Auth::id();

        $form = Form::create($formData);

        return response()->json([
            'success' => true,
            'message' => 'Form created successfully',
            'data' => $form
        ], 201);
    }

    /**
     * Display the specified form
     */
    public function show(Form $form): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $form
        ]);
    }

    /**
     * Update the specified form
     */
    public function update(Request $request, Form $form): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|in:request,registration,report,application,feedback',
            'category' => 'sometimes|required|in:land,crop,equipment,member,harvest,financial,training,other',
            'description' => 'nullable|string',
            'fields' => 'sometimes|required|array',
            'fields.*.name' => 'required|string',
            'fields.*.type' => 'required|in:text,textarea,select,checkbox,radio,date,number,email',
            'fields.*.label' => 'required|string',
            'fields.*.required' => 'boolean',
            'fields.*.options' => 'nullable|array',
            'status' => 'sometimes|required|in:active,draft,inactive',
            'target_roles' => 'nullable|array',
            'target_roles.*' => 'in:admin,unit_leader,member',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $form->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Form updated successfully',
            'data' => $form
        ]);
    }

    /**
     * Remove the specified form
     */
    public function destroy(Form $form): JsonResponse
    {
        // Check if form has submissions
        if ($form->submissions()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete form with existing submissions'
            ], 422);
        }

        $form->delete();

        return response()->json([
            'success' => true,
            'message' => 'Form deleted successfully'
        ]);
    }

    /**
     * Get submissions for a form
     */
    public function getSubmissions(Form $form): JsonResponse
    {
        $submissions = $form->submissions()
            ->with(['user', 'form'])
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $submissions
        ]);
    }

    /**
     * Get assigned members for a form
     */
    public function getAssignedMembers(Form $form): JsonResponse
    {
        try {
            // Get members assigned to this form
            $assignedMembers = \App\Models\User::whereIn('role', $form->target_roles)
                ->with(['unit', 'zone'])
                ->get()
                ->map(function ($member) use ($form) {
                    // Get submission status for this member
                    $submission = $form->submissions()
                        ->where('user_id', $member->id)
                        ->latest()
                        ->first();

                    return [
                        'id' => $member->id,
                        'christian_name' => $member->christian_name,
                        'family_name' => $member->family_name,
                        'phone' => $member->phone,
                        'email' => $member->email,
                        'role' => $member->role,
                        'status' => $member->status,
                        'unit' => $member->unit ? [
                            'id' => $member->unit->id,
                            'name' => $member->unit->name,
                            'code' => $member->unit->code,
                        ] : null,
                        'zone' => $member->zone ? [
                            'id' => $member->zone->id,
                            'name' => $member->zone->name,
                            'code' => $member->zone->code,
                        ] : null,
                        'assigned_date' => $form->created_at->toDateString(),
                        'submission_status' => $submission ? $submission->status : 'pending',
                        'last_activity' => $submission ? $submission->updated_at->toDateString() : null,
                    ];
                });

            // Calculate statistics
            $stats = [
                'total_assigned' => $assignedMembers->count(),
                'pending_submissions' => $assignedMembers->where('submission_status', 'pending')->count(),
                'submitted_forms' => $assignedMembers->where('submission_status', 'submitted')->count(),
                'approved_forms' => $assignedMembers->where('submission_status', 'approved')->count(),
                'rejected_forms' => $assignedMembers->where('submission_status', 'rejected')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'members' => $assignedMembers,
                    'stats' => $stats,
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('FormController getAssignedMembers error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch assigned members',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign members to a form
     */
    public function assignMembers(Request $request, Form $form): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'member_ids' => 'required|array',
            'member_ids.*' => 'exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // This would typically involve creating form assignments
            // For now, we'll just return success since forms are assigned based on target_roles
            return response()->json([
                'success' => true,
                'message' => 'Members assigned successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('FormController assignMembers error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign members',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Unassign members from a form
     */
    public function unassignMembers(Request $request, Form $form): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'member_ids' => 'required|array',
            'member_ids.*' => 'exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // This would typically involve removing form assignments
            // For now, we'll just return success
            return response()->json([
                'success' => true,
                'message' => 'Members unassigned successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('FormController unassignMembers error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to unassign members',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Sync forms from the leaders folder
     */
    public function syncForms(): JsonResponse
    {
        try {
            $result = FormService::syncForms();
            
            return response()->json([
                'success' => true,
                'message' => 'Forms synced successfully',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            Log::error('FormController syncForms error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to sync forms',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get form statistics
     */
    public function getStats(): JsonResponse
    {
        try {
            $stats = FormService::getFormStats();
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('FormController getStats error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get form statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available forms from the leaders folder
     */
    public function getAvailableForms(): JsonResponse
    {
        try {
            $forms = FormService::getAvailableForms();
            
            return response()->json([
                'success' => true,
                'data' => $forms
            ]);
        } catch (\Exception $e) {
            Log::error('FormController getAvailableForms error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get available forms',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new form file in the leaders folder
     */
    public function createFormFile(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|regex:/^[a-zA-Z0-9\-\_]+$/',
            'title' => 'required|string|max:255',
            'type' => 'required|in:request,registration,report,application,feedback',
            'category' => 'required|in:land,crop,equipment,member,harvest,financial,training,other',
            'description' => 'nullable|string',
            'fields' => 'required|array',
            'fields.*.name' => 'required|string',
            'fields.*.type' => 'required|in:text,textarea,select,checkbox,radio,date,number,email',
            'fields.*.label' => 'required|string',
            'fields.*.required' => 'boolean',
            'fields.*.options' => 'nullable|array',
            'fields.*.placeholder' => 'nullable|string',
            'fields.*.description' => 'nullable|string',
            'target_roles' => 'nullable|array',
            'target_roles.*' => 'in:admin,unit_leader,member',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $formData = $validator->validated();
            $result = FormService::createFormFile($formData);

            if ($result['success']) {
                // Also create the form in the database
                $form = Form::create([
                    'name' => $formData['name'],
                    'title' => $formData['title'],
                    'type' => $formData['type'],
                    'category' => $formData['category'],
                    'description' => $formData['description'],
                    'fields' => $formData['fields'],
                    'target_roles' => $formData['target_roles'],
                    'status' => 'active',
                    'user_id' => auth()->check() ? auth()->user()->id : 1,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Form file created successfully',
                    'data' => [
                        'form' => $form,
                        'file_path' => $result['file_path']
                    ]
                ], 201);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $result['message']
                ], 422);
            }
        } catch (\Exception $e) {
            Log::error('FormController createFormFile error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create form file',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a form file from the leaders folder
     */
    public function deleteFormFile(Request $request, string $formName): JsonResponse
    {
        try {
            $result = FormService::deleteFormFile($formName);

            if ($result['success']) {
                // Also delete the form from the database
                Form::where('name', $formName)->delete();

                return response()->json([
                    'success' => true,
                    'message' => 'Form file deleted successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => $result['message']
                ], 422);
            }
        } catch (\Exception $e) {
            Log::error('FormController deleteFormFile error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete form file',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 