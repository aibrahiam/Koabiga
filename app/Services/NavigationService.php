<?php

namespace App\Services;

use App\Models\Page;
use Illuminate\Support\Facades\Cache;

class NavigationService
{
    /**
     * Get navigation items for a specific role
     */
    public static function getNavigationForRole(string $role): array
    {
        $cacheKey = "navigation_{$role}";
        
        return Cache::remember($cacheKey, 300, function () use ($role) {
            return Page::byRole($role)
                ->active()
                ->orderBy('sort_order', 'asc')
                ->get()
                ->map(function ($page) {
                    return [
                        'title' => $page->title,
                        'href' => $page->path,
                        'icon' => $page->icon,
                        'description' => $page->description,
                        'features' => $page->features ?? [],
                    ];
                })
                ->toArray();
        });
    }

    /**
     * Clear navigation cache for a specific role
     */
    public static function clearNavigationCache(string $role): void
    {
        Cache::forget("navigation_{$role}");
    }

    /**
     * Clear all navigation caches
     */
    public static function clearAllNavigationCaches(): void
    {
        $roles = ['admin', 'unit_leader', 'member'];
        
        foreach ($roles as $role) {
            self::clearNavigationCache($role);
        }
    }

    /**
     * Get all pages for a role with additional metadata
     */
    public static function getPagesForRole(string $role): array
    {
        return Page::byRole($role)
            ->with(['creator', 'updater'])
            ->orderBy('sort_order', 'asc')
            ->get()
            ->map(function ($page) {
                return [
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
                    'created_by' => $page->created_by_name,
                    'updated_by' => $page->updated_by_name,
                    'last_modified' => $page->lastModified,
                ];
            })
            ->toArray();
    }

    /**
     * Get page statistics for a role
     */
    public static function getPageStatsForRole(string $role): array
    {
        $pages = Page::byRole($role);
        
        return [
            'total' => $pages->count(),
            'active' => $pages->where('status', 'active')->count(),
            'draft' => $pages->where('status', 'draft')->count(),
            'inactive' => $pages->where('status', 'inactive')->count(),
            'public' => $pages->where('is_public', true)->count(),
        ];
    }

    /**
     * Get all page statistics
     */
    public static function getAllPageStats(): array
    {
        $roles = ['admin', 'unit_leader', 'member'];
        $stats = [];
        
        foreach ($roles as $role) {
            $stats[$role] = self::getPageStatsForRole($role);
        }
        
        // Add overall stats
        $stats['overall'] = [
            'total' => Page::count(),
            'active' => Page::where('status', 'active')->count(),
            'draft' => Page::where('status', 'draft')->count(),
            'inactive' => Page::where('status', 'inactive')->count(),
            'public' => Page::where('is_public', true)->count(),
        ];
        
        return $stats;
    }
} 