import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useAuth } from '@/contexts/AuthContext';
import { storeUser, type User } from '@/lib/session-manager';

export function AuthSync() {
    const { login } = useAuth();
    const { auth } = usePage().props as { auth: { user: User | null } };

    useEffect(() => {
        if (auth?.user) {
            console.log('AuthSync: User found in Inertia props:', auth.user);
            // Store user in session storage and update AuthContext
            storeUser(auth.user);
            login(auth.user);
        }
    }, [auth?.user, login]);

    return null; // This component doesn't render anything
} 