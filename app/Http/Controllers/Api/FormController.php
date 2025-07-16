<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Services\FormFileGeneratorService;

class FormController extends Controller
{
    /**
     * Display a listing of forms
     */
    public function index(Request $request): JsonResponse
    {
        try {
            Log::info('FormController index called', [
                'request_params' => $request->all(),
                'user' => Auth::user() ? [
                    'id' => Auth::user()->id,
                    'role' => Auth::user()->role
                ] : 'Not authenticated'
            ]);

            $query = Form::query();

            // Apply filters
            if ($request->has('search') && !empty($request->get('search'))) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            if ($request->has('type') && $request->get('type') !== 'all') {
                $query->where('type', $request->get('type'));
            }

            if ($request->has('category') && $request->get('category') !== 'all') {
                $query->where('category', $request->get('category'));
            }

            if ($request->has('status') && $request->get('status') !== 'all') {
                $query->where('status', $request->get('status'));
            }

            // Filter by target_roles - handle JSON array column
            if ($request->has('target_roles') && $request->get('target_roles') !== 'all') {
                $targetRole = $request->get('target_roles');
                $query->whereJsonContains('target_roles', $targetRole);
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Check if we want paginated or simple response
            if ($request->has('per_page') && $request->get('per_page') === 'all') {
                $forms = $query->get();
                Log::info('Forms query result (simple)', [
                    'forms_count' => $forms->count()
                ]);
                
                return response()->json([
                    'success' => true,
                    'data' => $forms
                ]);
            } else {
                $forms = $query->paginate($request->get('per_page', 15));
                Log::info('Forms query result (paginated)', [
                    'total_forms' => $forms->total(),
                    'current_page' => $forms->currentPage(),
                    'per_page' => $forms->perPage(),
                    'forms_count' => $forms->count()
                ]);
                
                return response()->json([
                    'success' => true,
                    'data' => $forms
                ]);
            }
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
            'fields.*.placeholder' => 'nullable|string',
            'fields.*.description' => 'nullable|string',
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

        // Generate TypeScript form file
        try {
            $fileGenerator = new FormFileGeneratorService();
            $fileGenerated = $fileGenerator->generateFormFile($formData);
            
            if (!$fileGenerated) {
                Log::warning('Failed to generate form file', ['form_id' => $form->id, 'title' => $formData['title']]);
            }
        } catch (\Exception $e) {
            Log::error('Form file generation error: ' . $e->getMessage(), [
                'form_id' => $form->id,
                'title' => $formData['title']
            ]);
        }

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

        $oldTitle = $form->title;
        $form->update($validator->validated());

        // Update TypeScript form file if title or fields changed
        try {
            $fileGenerator = new FormFileGeneratorService();
            $updateData = array_merge($validator->validated(), ['title' => $form->title]);
            $fileUpdated = $fileGenerator->updateFormFile($updateData, $oldTitle);
            
            if (!$fileUpdated) {
                Log::warning('Failed to update form file', ['form_id' => $form->id, 'title' => $form->title]);
            }
        } catch (\Exception $e) {
            Log::error('Form file update error: ' . $e->getMessage(), [
                'form_id' => $form->id,
                'title' => $form->title
            ]);
        }

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

        $formTitle = $form->title;
        $form->delete();

        // Delete TypeScript form file
        try {
            $fileGenerator = new FormFileGeneratorService();
            $fileDeleted = $fileGenerator->deleteFormFile($formTitle);
            
            if (!$fileDeleted) {
                Log::warning('Failed to delete form file', ['title' => $formTitle]);
            }
        } catch (\Exception $e) {
            Log::error('Form file deletion error: ' . $e->getMessage(), [
                'title' => $formTitle
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Form deleted successfully'
        ]);
    }

    /**
     * Submit a form (for unit leaders)
     */
    public function submitForm(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'form_type' => 'required|string',
            'form_data' => 'required|array',
            'category' => 'required|string',
            'type' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = Auth::user();
            
            // Create form submission record
            $submission = \App\Models\FormSubmission::create([
                'form_id' => null, // We'll link this to a form if it exists
                'user_id' => $user->id,
                'form_type' => $request->form_type,
                'form_data' => $request->form_data,
                'category' => $request->category,
                'type' => $request->type,
                'status' => 'submitted',
                'submitted_at' => now(),
            ]);

            // Log the submission
            Log::info('Form submitted by unit leader', [
                'user_id' => $user->id,
                'form_type' => $request->form_type,
                'category' => $request->category,
                'submission_id' => $submission->id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Form submitted successfully',
                'data' => $submission
            ], 201);
        } catch (\Exception $e) {
            Log::error('Form submission error: ' . $e->getMessage(), [
                'user_id' => Auth::user()?->id,
                'form_type' => $request->form_type,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit form. Please try again.',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
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
     * Get assigned members for a specific form
     */
    public function getAssignedMembers($id): JsonResponse
    {
        try {
            Log::info('Fetching assigned members for form', ['form_id' => $id]);

            // Find the form
            $form = Form::find($id);
            if (!$form) {
                return response()->json([
                    'success' => false,
                    'message' => 'Form not found'
                ], 404);
            }

            // Get assigned members based on form target roles and units
            $query = User::query();

            // Filter by target roles if specified
            if ($form->target_roles && is_array($form->target_roles)) {
                $query->whereIn('role', $form->target_roles);
            }

            // Filter by target units if specified
            if ($form->target_units && is_array($form->target_units)) {
                $query->whereIn('unit_id', $form->target_units);
            }

            // Get members with their unit and zone information
            $members = $query->with(['unit', 'zone'])
                ->where('status', 'active')
                ->get()
                ->map(function ($user) use ($form) {
                    return [
                        'id' => $user->id,
                        'christian_name' => $user->christian_name,
                        'family_name' => $user->family_name,
                        'phone' => $user->phone,
                        'email' => $user->email,
                        'role' => $user->role,
                        'status' => $user->status,
                        'unit' => $user->unit ? [
                            'id' => $user->unit->id,
                            'name' => $user->unit->name,
                            'code' => $user->unit->code,
                        ] : null,
                        'zone' => $user->zone ? [
                            'id' => $user->zone->id,
                            'name' => $user->zone->name,
                            'code' => $user->zone->code,
                        ] : null,
                        'assigned_date' => now()->toISOString(), // This would come from a proper assignment table
                        'submission_status' => 'pending', // This would come from form submissions
                        'last_activity' => $user->last_activity_at,
                    ];
                });

            // Calculate statistics
            $stats = [
                'total_assigned' => $members->count(),
                'pending_submissions' => $members->where('submission_status', 'pending')->count(),
                'submitted_forms' => $members->where('submission_status', 'submitted')->count(),
                'approved_forms' => $members->where('submission_status', 'approved')->count(),
                'rejected_forms' => $members->where('submission_status', 'rejected')->count(),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'members' => $members,
                    'stats' => $stats,
                    'form' => [
                        'id' => $form->id,
                        'title' => $form->title,
                        'type' => $form->type,
                        'category' => $form->category,
                        'status' => $form->status,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching assigned members for form', [
                'form_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch assigned members',
                'error' => config('app.debug') ? $e->getMessage() : null
            ], 500);
        }
    }

    /**
     * Get forms available for unit leaders
     */
    public function getUnitLeaderForms(Request $request): JsonResponse
    {
        try {
            $query = Form::query();

            // Filter by target_roles to include unit_leader
            $query->whereJsonContains('target_roles', 'unit_leader');

            // Filter by status
            if ($request->has('status')) {
                $query->where('status', $request->get('status'));
            } else {
                $query->where('status', 'active');
            }

            // Apply search filter
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Apply type filter
            if ($request->has('type')) {
                $query->where('type', $request->get('type'));
            }

            // Apply category filter
            if ($request->has('category')) {
                $query->where('category', $request->get('category'));
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
            Log::error('getUnitLeaderForms error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
                'user' => Auth::user() ? [
                    'id' => Auth::user()->id,
                    'role' => Auth::user()->role
                ] : 'Not authenticated'
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching unit leader forms',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get forms specifically assigned to the unit leader's unit
     */
    public function getAssignedForms(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            if (!$user || $user->role !== 'unit_leader') {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access'
                ], 403);
            }

            // Get the unit leader's unit
            $unit = \App\Models\Unit::where('leader_id', $user->id)->first();
            if (!$unit) {
                return response()->json([
                    'success' => false,
                    'message' => 'No unit assigned to this leader'
                ], 404);
            }

            $query = Form::query();

            // Filter by target_roles to include unit_leader
            $query->whereJsonContains('target_roles', 'unit_leader');

            // Filter by status
            $query->where('status', 'active');

            // Apply search filter
            if ($request->has('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Apply type filter
            if ($request->has('type')) {
                $query->where('type', $request->get('type'));
            }

            // Apply category filter
            if ($request->has('category')) {
                $query->where('category', $request->get('category'));
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $forms = $query->paginate($request->get('per_page', 15));

            return response()->json([
                'success' => true,
                'data' => $forms,
                'unit' => [
                    'id' => $unit->id,
                    'name' => $unit->name,
                    'code' => $unit->code
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('getAssignedForms error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
                'user' => Auth::user() ? [
                    'id' => Auth::user()->id,
                    'role' => Auth::user()->role
                ] : 'Not authenticated'
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching assigned forms',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 