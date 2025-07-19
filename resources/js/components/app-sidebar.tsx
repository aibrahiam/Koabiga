import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { SidebarGroup, SidebarGroupLabel } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, Building2, FileText, ListChecks, FileStack, ClipboardList, BarChart2, Settings, MapPin, User, LogOut } from 'lucide-react';
import AppLogo from './app-logo';
import { useAuth } from '@/contexts/AuthContext';
import { UserInfo } from '@/components/user-info';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/koabiga/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Zone Management',
        href: '/koabiga/admin/admin-zones',
        icon: MapPin,
    },
    {
        title: 'Members',
                        href: '/koabiga/admin/admin-members',
        icon: Users,
    },
    {
        title: 'Units',
        href: '/koabiga/admin/admin-units',
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
        href: '/koabiga/admin/admin-forms',
        icon: ClipboardList,
    },
    {
        title: 'Reports',
        href: '/koabiga/admin/admin-reports',
        icon: BarChart2,
    },
];

export function AppSidebar() {
    const { user, logout } = useAuth();

    // Add debugging
    console.log('AppSidebar - user:', user);
    console.log('AppSidebar - user name:', user?.name);
    console.log('AppSidebar - localStorage koabiga_user:', localStorage.getItem('koabiga_user'));

    const handleLogout = async () => {
        try {
            const response = await fetch('/logout', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            // If backend signals to clear frontend session, do it
            if (result.clearFrontendSession) {
                logout();
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Even if backend call fails, clear frontend session
            logout();
        }
        
        window.location.href = '/';
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/koabiga/admin/dashboard" prefetch>
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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
