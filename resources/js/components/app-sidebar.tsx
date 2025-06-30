import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, Building2, FileText, ListChecks, FileStack, ClipboardList, BarChart2, Settings, MapPin } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/koabiga/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Zone Management',
        href: '/koabiga/admin/zone',
        icon: MapPin,
    },
    {
        title: 'Members',
        href: '/koabiga/admin/members',
        icon: Users,
    },
    {
        title: 'Units',
        href: '/koabiga/admin/units',
        icon: Building2,
    },
    {
        title: 'Fee Rules',
        href: '/koabiga/admin/fee-rules',
        icon: ListChecks,
    },
    {
        title: 'Logs',
        href: '/koabiga/admin/logs',
        icon: FileText,
    },
    {
        title: 'Page Management',
        href: '/koabiga/admin/page-management',
        icon: FileStack,
    },
    {
        title: 'Forms',
        href: '/koabiga/admin/forms',
        icon: ClipboardList,
    },
    {
        title: 'Reports',
        href: '/koabiga/admin/reports',
        icon: BarChart2,
    },
    {
        title: 'Settings',
        href: '/koabiga/admin/settings',
        icon: Settings,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
