import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { Link, usePage, router } from '@inertiajs/react';
import { LayoutGrid, Users, MapPin, Sprout, Package, FileText, ClipboardList, LogOut } from 'lucide-react';
import AppLogo from './app-logo';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Dynamic navigation will be loaded from the database
const unitLeaderNavItems = [
    {
        title: 'Dashboard',
        href: '/koabiga/leaders/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Members',
        href: '/koabiga/leaders/leader-members',
        icon: Users,
    },
    {
        title: 'Land Management',
        href: '/koabiga/leaders/land',
        icon: MapPin,
    },
    {
        title: 'Crop Management',
        href: '/koabiga/leaders/crops',
        icon: Sprout,
    },
    {
        title: 'Produce Tracking',
        href: '/koabiga/leaders/produce',
        icon: Package,
    },
    {
        title: 'Reports',
        href: '/koabiga/leaders/reports',
        icon: FileText,
    },
    {
        title: 'Forms',
        href: '/koabiga/leaders/leaders-forms',
        icon: ClipboardList,
    },
];

export function UnitLeaderSidebar() {
    const sidebarContext = useSidebar();
    const sidebarState = sidebarContext?.state || 'expanded';
    const { auth } = usePage().props as any;
    const user = auth?.user;

    const handleLogout = () => {
        router.post('/logout');
    };

    const getUserInitials = () => {
        if (!user) return 'U';
        const christianName = user.christian_name || '';
        const familyName = user.family_name || '';
        return `${christianName.charAt(0)}${familyName.charAt(0)}`.toUpperCase();
    };

    const getUserName = () => {
        if (!user) return 'User';
        return `${user.christian_name || ''} ${user.family_name || ''}`.trim() || 'Unit Leader';
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <div className="flex flex-col items-center justify-center py-4">
                    <div className="flex flex-col items-center gap-1">
                        <div className="flex aspect-square size-8 items-center justify-center rounded-md">
                            <img src="/logo.png" alt="Koabiga Logo" className="h-8 w-8 rounded-md object-cover shadow" />
                        </div>
                        {sidebarState === 'expanded' && (
                            <span className="mt-1 text-black dark:text-white font-bold text-sm tracking-wide">Koabiga</span>
                        )}
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="flex flex-col h-full">
                <SidebarMenu className="flex-1">
                    {unitLeaderNavItems.map(item => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton asChild>
                                <Link href={item.href} className="flex items-center gap-2 px-4 py-2 text-sm">
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
                
                {/* User Profile and Logout Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    {sidebarState === 'expanded' ? (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.avatar} alt={getUserName()} />
                                <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium">
                                    {getUserInitials()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {getUserName()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {user?.role || 'unit_leader'}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="h-8 w-8 p-0 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            >
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={user?.avatar} alt={getUserName()} />
                                            <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium">
                                                {getUserInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem className="flex flex-col items-start p-3">
                                        <p className="text-sm font-medium">{getUserName()}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user?.role || 'unit_leader'}</p>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            </SidebarContent>
        </Sidebar>
    );
} 