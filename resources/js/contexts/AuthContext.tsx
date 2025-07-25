import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { clearSession, storeUser, getUser, migrateLegacySession, type User } from '@/lib/session-manager';

export type UserRole = 'admin' | 'unit_leader' | 'member' | 'zone_leader';
export type { User };

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (userData: User) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Unified login success handler
    const handleLoginSuccess = (userData: User) => {
        // Store user data using session manager
        storeUser(userData);
        setUser(userData);
    };

    // Unified login function
    const login = (userData: User) => {
        handleLoginSuccess(userData);
    };

    // Complete logout function
    const logout = () => {
        setUser(null);
        clearSession();
    };

    // Initialize user state from session storage
    useEffect(() => {
        try {
            // Try to get user from session storage
            const userData = getUser();
            if (userData) {
                console.log('AuthContext: User found in session storage:', userData);
                setUser(userData);
            } else {
                // Try to migrate legacy session data
                const migratedUser = migrateLegacySession();
                if (migratedUser) {
                    console.log('AuthContext: User migrated from legacy session:', migratedUser);
                    setUser(migratedUser);
                } else {
                    console.log('AuthContext: No user found anywhere');
                }
            }
        } catch (error) {
            console.error('AuthContext: Error initializing user state:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

// Role-based route protection hook
export function useRoleGuard(allowedRoles: UserRole[]) {
    const { user, isAuthenticated } = useAuth();
    
    if (!isAuthenticated) {
        return { hasAccess: false, redirectTo: '/login' };
    }
    
    if (!user || !allowedRoles.includes(user.role)) {
        return { hasAccess: false, redirectTo: '/dashboard' };
    }
    
    return { hasAccess: true, redirectTo: null };
} 

// Re-export session manager functions for convenience
export { getUser as getAuthUser } from '@/lib/session-manager'; 