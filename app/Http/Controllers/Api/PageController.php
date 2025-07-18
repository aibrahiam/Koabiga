<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class PageController extends Controller
{
    /**
     * Display a listing of pages
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Page::with(['creator', 'updater']);

            // Apply search filter
            if ($request->has('search') && $request->get('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('path', 'like', "%{$search}%");
                });
            }

            // Apply role filter
            if ($request->has('role') && $request->get('role') !== 'all') {
                $query->where('role', $request->get('role'));
            }

            // Apply status filter
            if ($request->has('status') && $request->get('status') !== 'all') {
                $query->where('status', $request->get('status'));
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'sort_order');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Get paginated results
            $perPage = $request->get('per_page', 15);
            $pages = $query->paginate($perPage);

            // Transform data for frontend
            $transformedPages = $pages->getCollection()->map(function ($page) {
                return [
                    'id' => $page->id,
                    'title' => $page->title,
                    'path' => $page->path,
                    'role' => $page->role,
                    'status' => $page->status,
                    'lastModified' => $page->lastModified,
                    'description' => $page->description,
                    'features' => $page->features ?? [],
                    'createdBy' => $page->created_by_name,
                    'icon' => $page->icon,
                    'sort_order' => $page->sort_order,
                    'is_public' => $page->is_public,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'data' => $transformedPages,
                    'current_page' => $pages->currentPage(),
                    'last_page' => $pages->lastPage(),
                    'per_page' => $pages->perPage(),
                    'total' => $pages->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pages: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created page
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'path' => 'required|string|max:255|unique:pages',
            'role' => 'required|in:admin,unit_leader,member',
            'description' => 'nullable|string',
            'features' => 'nullable|array',
            'features.*' => 'string',
            'permissions' => 'nullable|array',
            'status' => 'required|in:active,draft,inactive',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer|min:0',
            'is_public' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $pageData = $validator->validated();
            $pageData['created_by'] = Auth::id();
            $pageData['updated_by'] = Auth::id();

            $page = Page::create($pageData);

            return response()->json([
                'success' => true,
                'message' => 'Page created successfully',
                'data' => [
                    'id' => $page->id,
                    'title' => $page->title,
                    'path' => $page->path,
                    'role' => $page->role,
                    'status' => $page->status,
                    'lastModified' => $page->lastModified,
                    'description' => $page->description,
                    'features' => $page->features ?? [],
                    'createdBy' => $page->created_by_name,
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create page: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified page
     */
    public function show($id): JsonResponse
    {
        try {
            $page = Page::with(['creator', 'updater'])->find($id);

            if (!$page) {
                return response()->json([
                    'success' => false,
                    'message' => 'Page not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $page->id,
                    'title' => $page->title,
                    'path' => $page->path,
                    'role' => $page->role,
                    'status' => $page->status,
                    'lastModified' => $page->lastModified,
                    'description' => $page->description,
                    'features' => $page->features ?? [],
                    'createdBy' => $page->created_by_name,
                    'icon' => $page->icon,
                    'sort_order' => $page->sort_order,
                    'is_public' => $page->is_public,
                    'permissions' => $page->permissions ?? [],
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch page: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified page
     */
    public function update(Request $request, $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'path' => 'sometimes|required|string|max:255|unique:pages,path,' . $id,
            'role' => 'sometimes|required|in:admin,unit_leader,member',
            'description' => 'nullable|string',
            'features' => 'nullable|array',
            'features.*' => 'string',
            'permissions' => 'nullable|array',
            'status' => 'sometimes|required|in:active,draft,inactive',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer|min:0',
            'is_public' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $page = Page::find($id);

            if (!$page) {
                return response()->json([
                    'success' => false,
                    'message' => 'Page not found'
                ], 404);
            }

            $pageData = $validator->validated();
            $pageData['updated_by'] = Auth::id();

            $page->update($pageData);

            return response()->json([
                'success' => true,
                'message' => 'Page updated successfully',
                'data' => [
                    'id' => $page->id,
                    'title' => $page->title,
                    'path' => $page->path,
                    'role' => $page->role,
                    'status' => $page->status,
                    'lastModified' => $page->lastModified,
                    'description' => $page->description,
                    'features' => $page->features ?? [],
                    'createdBy' => $page->created_by_name,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update page: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified page
     */
    public function destroy($id): JsonResponse
    {
        try {
            $page = Page::find($id);

            if (!$page) {
                return response()->json([
                    'success' => false,
                    'message' => 'Page not found'
                ], 404);
            }

            $page->delete();

            return response()->json([
                'success' => true,
                'message' => 'Page deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete page: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pages by role
     */
    public function getByRole($role): JsonResponse
    {
        try {
            $pages = Page::byRole($role)
                ->active()
                ->orderBy('sort_order', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $pages
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch pages: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get navigation items for a specific role
     */
    public function getNavigationForRole($role): JsonResponse
    {
        try {
            $pages = Page::byRole($role)
                ->active()
                ->orderBy('sort_order', 'asc')
                ->get();

            $navigationItems = $pages->map(function ($page) {
                return [
                    'title' => $page->title,
                    'href' => $page->path,
                    'icon' => $page->icon,
                    'description' => $page->description,
                    'features' => $page->features ?? [],
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $navigationItems
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch navigation: ' . $e->getMessage()
            ], 500);
        }
    }
} 