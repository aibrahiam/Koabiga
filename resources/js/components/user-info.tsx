import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/contexts/AuthContext';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const getInitials = useInitials();

    console.log('UserInfo component - received user:', user);

    if (!user) {
        console.log('UserInfo component - no user, returning null');
        return null;
    }

    // Get the display name - prefer the formatted name if available
    const displayName = user.name || `${user.christian_name || ''} ${user.family_name || ''}`.trim() || 'User';
    const initials = getInitials(displayName);
    
    console.log('UserInfo component - displayName:', displayName);
    console.log('UserInfo component - initials:', initials);

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full border-2 border-green-200 dark:border-green-700">
                <AvatarImage src={user.avatar || undefined} alt={displayName} />
                <AvatarFallback className="rounded-lg bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-semibold">
                    {initials}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-green-800 dark:text-green-200">{displayName}</span>
                {showEmail && <span className="truncate text-xs text-green-600 dark:text-green-400">{user.email}</span>}
            </div>
        </>
    );
}
