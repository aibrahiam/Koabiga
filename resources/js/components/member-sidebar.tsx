import { Link, usePage, router } from '@inertiajs/react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import { 
    Home, 
    MapPin, 
    Sprout, 
    Package, 
    FileText, 
    TrendingUp,
    Settings,
    LogOut
} from 'lucide-react';
import { type PageProps } from '@/types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const memberNavItems = [
    {
        title: 'Dashboard',
        href: '/koabiga/members/dashboard',
        icon: Home,
    },
    {
        title: 'My Land',
        href: '/koabiga/members/land',
        icon: MapPin,
    },
    {
        title: 'My Crops',
        href: '/koabiga/members/crops',
        icon: Sprout,
    },
    {
        title: 'My Produce',
        href: '/koabiga/members/produce',
        icon: Package,
    },
    {
        title: 'My Reports',
        href: '/koabiga/members/reports',
        icon: FileText,
    },
    {
        title: 'My Forms',
        href: '/koabiga/members/forms',
        icon: FileText,
    },
    {
        title: 'My Fees',
        href: '/koabiga/members/fees',
        icon: TrendingUp,
    },
];

export function MemberSidebar() {
    const sidebarContext = useSidebar();
    const sidebarState = sidebarContext?.state || 'expanded';
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;

    const handleLogout = () => {
        router.post('/logout');
    };

    const getUserInitials = () => {
        if (!user) return 'M';
        const christianName = (user.christian_name || '').toString();
        const familyName = (user.family_name || '').toString();
        const first = christianName.charAt(0) || '';
        const last = familyName.charAt(0) || '';
        return `${first}${last}`.toUpperCase() || 'M';
    };

    const getUserName = () => {
        if (!user) return 'User';
        return `${user.christian_name || ''} ${user.family_name || ''}`.trim() || 'Member';
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
                    {memberNavItems.map(item => (
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
                                <AvatarFallback className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs font-medium">
                                    {getUserInitials()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {getUserName()}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {(user?.role || 'member').toString()}
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
                                            <AvatarFallback className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs font-medium">
                                                {getUserInitials()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuItem className="flex flex-col items-start p-3">
                                        <p className="text-sm font-medium">{getUserName()}</p>
                                        <p className="text-xs text-gray-500 capitalize">{(user?.role || 'member').toString()}</p>
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