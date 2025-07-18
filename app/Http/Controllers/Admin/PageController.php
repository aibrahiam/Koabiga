<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\NavigationService;
use App\Models\Page;
use App\Models\User;
use App\Models\Unit;
use App\Models\Zone;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    /**
     * Display the page management interface
     */
    public function index(): Response
    {
        $pages = Page::with(['creator', 'updater'])
            ->orderBy('sort_order', 'asc')
            ->get()
            ->map(function ($page) {
                return [
                    'id' => $page->id,
                    'title' => $page->title,
                    'path' => $page->path,
                    'role' => $page->role,
                    'status' => $page->status,
                    'lastModified' => $page->lastModified,
                    'description' => $page->description,
                    'createdBy' => $page->created_by_name,
                    'icon' => $page->icon,
                    'sort_order' => $page->sort_order,
                    'is_public' => $page->is_public,
                    'features' => $page->features ?? [],
                ];
            });

        $users = User::with(['unit', 'zone'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'christian_name' => $user->christian_name,
                    'family_name' => $user->family_name,
                    'id_passport' => $user->id_passport,
                    'phone' => $user->phone,
                    'role' => $user->role,
                    'status' => $user->status,
                    'join_date' => $user->created_at->format('Y-m-d'),
                    'unit' => $user->unit?->name,
                    'zone' => $user->zone?->name,
                    'unit_id' => $user->unit_id,
                    'zone_id' => $user->zone_id,
                ];
            });

        $units = Unit::orderBy('name')->get(['id', 'name', 'code']);
        $zones = Zone::orderBy('name')->get(['id', 'name', 'code']);

        $pageStats = NavigationService::getAllPageStats();

        return Inertia::render('koabiga/admin/pages/page-management', [
            'pages' => $pages,
            'users' => $users,
            'units' => $units,
            'zones' => $zones,
            'pageStats' => $pageStats,
        ]);
    }

    /**
     * Show the form for creating a new page
     */
    public function create(): Response
    {
        return Inertia::render('koabiga/admin/pages/create-page');
    }

    /**
     * Show the form for editing a page
     */
    public function edit(Page $page): Response
    {
        $pageData = [
            'id' => $page->id,
            'title' => $page->title,
            'path' => $page->path,
            'role' => $page->role,
            'status' => $page->status,
            'description' => $page->description,
            'icon' => $page->icon,
            'sort_order' => $page->sort_order,
            'is_public' => $page->is_public,
            'features' => $page->features ?? [],
            'permissions' => $page->permissions ?? [],
        ];

        return Inertia::render('koabiga/admin/pages/edit-page', [
            'page' => $pageData,
        ]);
    }

    /**
     * Get navigation preview for a role
     */
    public function getNavigationPreview(string $role): \Illuminate\Http\JsonResponse
    {
        $navigation = NavigationService::getNavigationForRole($role);
        
        return response()->json([
            'success' => true,
            'data' => $navigation,
        ]);
    }

    /**
     * Get page statistics
     */
    public function getStats(): \Illuminate\Http\JsonResponse
    {
        $stats = NavigationService::getAllPageStats();
        
        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Store a newly created page
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'path' => 'required|string|max:255|unique:pages,path',
            'role' => 'required|in:admin,unit_leader,member',
            'status' => 'required|in:active,inactive,draft',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer|min:0',
            'is_public' => 'boolean',
            'features' => 'nullable|array',
        ]);

        $page = Page::create([
            'title' => $request->title,
            'path' => $request->path,
            'role' => $request->role,
            'status' => $request->status,
            'description' => $request->description,
            'icon' => $request->icon,
            'sort_order' => $request->sort_order ?? 0,
            'is_public' => $request->is_public ?? false,
            'features' => $request->features ?? [],
            'created_by' => auth()->user()->id,
            'updated_by' => auth()->user()->id,
        ]);

        return redirect()->route('koabiga.admin.page-management')
            ->with('success', 'Page created successfully');
    }

    /**
     * Update the specified page
     */
    public function update(Request $request, Page $page)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'path' => 'required|string|max:255|unique:pages,path,' . $page->id,
            'role' => 'required|in:admin,unit_leader,member',
            'status' => 'required|in:active,inactive,draft',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer|min:0',
            'is_public' => 'boolean',
            'features' => 'nullable|array',
        ]);

        $page->update([
            'title' => $request->title,
            'path' => $request->path,
            'role' => $request->role,
            'status' => $request->status,
            'description' => $request->description,
            'icon' => $request->icon,
            'sort_order' => $request->sort_order ?? 0,
            'is_public' => $request->is_public ?? false,
            'features' => $request->features ?? [],
            'updated_by' => auth()->user()->id,
        ]);

        return redirect()->route('koabiga.admin.page-management')
            ->with('success', 'Page updated successfully');
    }

    /**
     * Remove the specified page
     */
    public function destroy(Page $page)
    {
        $page->delete();

        return redirect()->route('koabiga.admin.page-management')
            ->with('success', 'Page deleted successfully');
    }
} 