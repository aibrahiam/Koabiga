<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Page;
use App\Models\User;

class PageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin user for created_by field
        $adminUser = User::where('role', 'admin')->first();

        // Admin Pages
        $adminPages = [
            [
                'title' => 'Dashboard',
                'path' => '/koabiga/admin/dashboard',
                'role' => 'admin',
                'description' => 'Admin dashboard overview',
                'icon' => 'LayoutGrid',
                'sort_order' => 1,
                'status' => 'active',
                'is_public' => false,
                'features' => ['overview', 'statistics', 'quick_actions'],
            ],
            [
                'title' => 'Zone Management',
                'path' => '/koabiga/admin/zones',
                'role' => 'admin',
                'description' => 'Manage agricultural zones',
                'icon' => 'MapPin',
                'sort_order' => 2,
                'status' => 'active',
                'is_public' => false,
                'features' => ['create', 'edit', 'delete', 'view'],
            ],
            [
                'title' => 'Members',
                'path' => '/koabiga/admin/admin-members',
                'role' => 'admin',
                'description' => 'Manage all platform members',
                'icon' => 'Users',
                'sort_order' => 3,
                'status' => 'active',
                'is_public' => false,
                'features' => ['create', 'edit', 'delete', 'view', 'import', 'export'],
            ],
            [
                'title' => 'Units',
                'path' => '/koabiga/admin/admin-units',
                'role' => 'admin',
                'description' => 'Manage agricultural units',
                'icon' => 'Building2',
                'sort_order' => 4,
                'status' => 'active',
                'is_public' => false,
                'features' => ['create', 'edit', 'delete', 'view'],
            ],
            [
                'title' => 'Fee Rules',
                'path' => '/koabiga/admin/fee-rules',
                'role' => 'admin',
                'description' => 'Manage platform fee structures',
                'icon' => 'ListChecks',
                'sort_order' => 5,
                'status' => 'active',
                'is_public' => false,
                'features' => ['create', 'edit', 'delete', 'view', 'apply', 'schedule'],
            ],
            [
                'title' => 'Forms',
                'path' => '/koabiga/admin/forms',
                'role' => 'admin',
                'description' => 'Manage system forms',
                'icon' => 'ClipboardList',
                'sort_order' => 6,
                'status' => 'active',
                'is_public' => false,
                'features' => ['create', 'edit', 'delete', 'view', 'assign'],
            ],
            [
                'title' => 'Reports',
                'path' => '/koabiga/admin/reports',
                'role' => 'admin',
                'description' => 'Review and approve reports',
                'icon' => 'BarChart2',
                'sort_order' => 7,
                'status' => 'active',
                'is_public' => false,
                'features' => ['view', 'approve', 'reject', 'export'],
            ],
            [
                'title' => 'System Logs',
                'path' => '/koabiga/admin/logs',
                'role' => 'admin',
                'description' => 'Monitor system activities and errors',
                'icon' => 'FileText',
                'sort_order' => 8,
                'status' => 'active',
                'is_public' => false,
                'features' => ['activity_logs', 'error_logs', 'login_sessions', 'system_metrics'],
            ],
            [
                'title' => 'Page Management',
                'path' => '/koabiga/admin/page-management',
                'role' => 'admin',
                'description' => 'Manage user pages and content',
                'icon' => 'FileStack',
                'sort_order' => 9,
                'status' => 'active',
                'is_public' => false,
                'features' => ['create', 'edit', 'delete', 'view', 'publish'],
            ],
        ];

        // Unit Leader Pages
        $unitLeaderPages = [
            [
                'title' => 'Dashboard',
                'path' => '/koabiga/unit-leader/dashboard',
                'role' => 'unit_leader',
                'description' => 'Unit leader dashboard overview',
                'icon' => 'LayoutGrid',
                'sort_order' => 1,
                'status' => 'active',
                'is_public' => false,
                'features' => ['overview', 'unit_stats', 'quick_actions'],
            ],
            [
                'title' => 'Members',
                'path' => '/koabiga/unit-leader/leader-members',
                'role' => 'unit_leader',
                'description' => 'Manage unit members',
                'icon' => 'Users',
                'sort_order' => 2,
                'status' => 'active',
                'is_public' => false,
                'features' => ['view', 'create', 'edit', 'assign_land'],
            ],
            [
                'title' => 'Land Management',
                'path' => '/koabiga/unit-leader/land',
                'role' => 'unit_leader',
                'description' => 'Manage unit land',
                'icon' => 'MapPin',
                'sort_order' => 3,
                'status' => 'active',
                'is_public' => false,
                'features' => ['view', 'assign', 'edit'],
            ],
            [
                'title' => 'Crop Management',
                'path' => '/koabiga/unit-leader/crops',
                'role' => 'unit_leader',
                'description' => 'Track crop progress',
                'icon' => 'Sprout',
                'sort_order' => 4,
                'status' => 'active',
                'is_public' => false,
                'features' => ['view', 'create', 'edit', 'monitor'],
            ],
            [
                'title' => 'Produce Tracking',
                'path' => '/koabiga/unit-leader/produce',
                'role' => 'unit_leader',
                'description' => 'Monitor produce output',
                'icon' => 'Package',
                'sort_order' => 5,
                'status' => 'active',
                'is_public' => false,
                'features' => ['view', 'record', 'edit', 'reports'],
            ],
            [
                'title' => 'Reports',
                'path' => '/koabiga/unit-leader/reports',
                'role' => 'unit_leader',
                'description' => 'Submit and view reports',
                'icon' => 'FileText',
                'sort_order' => 6,
                'status' => 'active',
                'is_public' => false,
                'features' => ['create', 'view', 'submit', 'export'],
            ],
            [
                'title' => 'Forms',
                'path' => '/koabiga/unit-leader/forms',
                'role' => 'unit_leader',
                'description' => 'Access unit forms',
                'icon' => 'ClipboardList',
                'sort_order' => 7,
                'status' => 'active',
                'is_public' => false,
                'features' => ['view', 'submit', 'track'],
            ],
        ];

        // Member Pages
        $memberPages = [
            [
                'title' => 'Dashboard',
                'path' => '/koabiga/members/dashboard',
                'role' => 'member',
                'description' => 'Member dashboard overview',
                'icon' => 'Home',
                'sort_order' => 1,
                'status' => 'active',
                'is_public' => false,
                'features' => ['overview', 'personal_stats', 'quick_actions'],
            ],
            [
                'title' => 'My Land',
                'path' => '/koabiga/members/land',
                'role' => 'member',
                'description' => 'Manage assigned land',
                'icon' => 'MapPin',
                'sort_order' => 2,
                'status' => 'active',
                'is_public' => false,
                'features' => ['view', 'details', 'history'],
            ],
            [
                'title' => 'My Crops',
                'path' => '/koabiga/members/crops',
                'role' => 'member',
                'description' => 'Track crop progress',
                'icon' => 'Sprout',
                'sort_order' => 3,
                'status' => 'active',
                'is_public' => false,
                'features' => ['view', 'track', 'update'],
            ],
            [
                'title' => 'My Produce',
                'path' => '/koabiga/members/produce',
                'role' => 'member',
                'description' => 'Monitor your produce',
                'icon' => 'Package',
                'sort_order' => 4,
                'status' => 'active',
                'is_public' => false,
                'features' => ['view', 'record', 'history'],
            ],
            [
                'title' => 'My Reports',
                'path' => '/koabiga/members/reports',
                'role' => 'member',
                'description' => 'Submit reports',
                'icon' => 'FileText',
                'sort_order' => 5,
                'status' => 'active',
                'is_public' => false,
                'features' => ['create', 'view', 'submit'],
            ],
            [
                'title' => 'My Forms',
                'path' => '/koabiga/members/forms',
                'role' => 'member',
                'description' => 'Access forms',
                'icon' => 'FileText',
                'sort_order' => 6,
                'status' => 'active',
                'is_public' => false,
                'features' => ['view', 'submit', 'track'],
            ],
            [
                'title' => 'My Fees',
                'path' => '/koabiga/members/fees',
                'role' => 'member',
                'description' => 'View fee obligations',
                'icon' => 'TrendingUp',
                'sort_order' => 7,
                'status' => 'active',
                'is_public' => false,
                'features' => ['view', 'pay', 'history'],
            ],
        ];

        // Insert all pages
        $allPages = array_merge($adminPages, $unitLeaderPages, $memberPages);

        foreach ($allPages as $pageData) {
            Page::updateOrCreate(
                ['path' => $pageData['path']],
                array_merge($pageData, [
                    'created_by' => $adminUser?->id,
                    'updated_by' => $adminUser?->id,
                ])
            );
        }

        $this->command->info('Pages seeded successfully!');
    }
} 