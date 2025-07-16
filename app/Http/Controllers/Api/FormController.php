<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
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
} 