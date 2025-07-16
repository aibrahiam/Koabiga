import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { clearSession, storeUser, getUser, migrateLegacySession } from '@/lib/session-manager';

export type UserRole = 'admin' | 'unit_leader' | 'member';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    unit?: string;
    avatar?: string;
    christian_name?: string;
    family_name?: string;
    phone?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (userData: User) => void;
    logout: () => void;
    loading: boolean;
    setTestUser: (userData: User) => void; // For testing purposes
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Test function to manually set user data
    const setTestUser = (userData: User) => {
        console.log('Setting test user:', userData);
        handleLoginSuccess(userData);
    };

    // Unified login success handler
    const handleLoginSuccess = (userData: User) => {
        // Store user data using session manager
        storeUser(userData);
        setUser(userData);
        
        console.log('Login successful, user data stored:', userData);
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

    // Check for existing session on mount
    useEffect(() => {
        console.log('AuthContext: Checking for existing session...');
        
        // Try to get user from session manager
        const userData = getUser();
        
        if (userData) {
            console.log('AuthContext: Found user in session:', userData);
                setUser(userData);
        } else {
            // Try to migrate legacy session data
            const migratedUser = migrateLegacySession();
            if (migratedUser) {
                console.log('AuthContext: Migrated legacy session:', migratedUser);
                setUser(migratedUser);
            } else {
                console.log('AuthContext: No user data found in localStorage');
            }
        }
        setLoading(false);
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading,
        setTestUser,
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
export { getRoleBasedRedirect, getUser as getAuthUser } from '@/lib/session-manager'; 