import { Link, usePage, router } from '@inertiajs/react';
import { LayoutGrid, Users, MapPin, Sprout, Package, FileText, ClipboardList, User, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const navItems = [
  { title: 'Dashboard', href: '/koabiga/unit-leader/dashboard', icon: LayoutGrid },
  { title: 'Members', href: '/koabiga/unit-leader/leader-members', icon: Users },
  { title: 'Land', href: '/koabiga/unit-leader/land', icon: MapPin },
  { title: 'Crops', href: '/koabiga/unit-leader/crops', icon: Sprout },
  { title: 'Forms', href: '/koabiga/unit-leader/forms', icon: ClipboardList },
];

export default function UnitLeaderBottomNavbar() {
  const { url } = usePage();
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-800 h-16 md:hidden shadow-2xl rounded-t-2xl px-3 py-2 transition-all backdrop-blur-md backdrop-saturate-150 border-x border-b-0 border-gray-300/40 dark:border-gray-700/60">
      {navItems.map((item) => {
        const isActive = url.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full text-xs transition-all duration-200 ${isActive ? 'text-blue-600 dark:text-blue-400 font-semibold scale-110' : 'text-gray-500 dark:text-gray-300'} group`}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="relative flex items-center justify-center">
              <item.icon
                className={`mb-0.5 h-6 w-6 transition-all duration-200 ${isActive ? 'text-blue-600 dark:text-blue-400 drop-shadow-lg scale-125' : 'text-gray-400 dark:text-gray-500'}`}
                aria-hidden="true"
              />
              {isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full shadow-md animate-bounce" />
              )}
            </span>
            {item.title}
          </Link>
        );
      })}
      
      {/* User Profile Section */}
      <div className="flex flex-col items-center justify-center flex-1 h-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex flex-col items-center justify-center h-full p-0 text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <span className="relative flex items-center justify-center">
                <Avatar className="h-6 w-6 mb-0.5">
                  <AvatarImage src={user?.avatar} alt={getUserName()} />
                  <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </span>
              <span className="text-xs">Profile</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="top" className="w-56 mb-2">
            <DropdownMenuItem className="flex flex-col items-start p-3">
              <p className="text-sm font-medium">{getUserName()}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role || 'unit_leader'}</p>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/koabiga/unit-leader/leader-members" className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Manage Members
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/koabiga/unit-leader/forms" className="flex items-center">
                <ClipboardList className="mr-2 h-4 w-4" />
                Unit Forms
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/koabiga/unit-leader/reports" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Reports
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
} 