import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { useAuth } from '@/contexts/AuthContext';
import { type User } from '@/contexts/AuthContext';
import { LogOut, Settings } from 'lucide-react';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { logout } = useAuth();

    const handleLogout = async () => {
        cleanup();
        
        try {
            // Call logout endpoint
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
        
        // Redirect to home page after logout
        window.location.href = '/';
    };

    // Get settings link based on user role
    const getSettingsLink = () => {
        switch (user.role) {
            case 'admin':
                return '/koabiga/admin/settings';
            case 'unit_leader':
                return '/koabiga/unit-leader/settings';
            case 'member':
                return '/koabiga/member/settings';
            default:
                return '/settings';
        }
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <a href={getSettingsLink()} className="block w-full text-left" onClick={cleanup}>
                        <Settings className="mr-2" />
                        Settings
                    </a>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <button className="block w-full text-left" onClick={handleLogout}>
                    <LogOut className="mr-2" />
                    Log out
                </button>
            </DropdownMenuItem>
        </>
    );
}
