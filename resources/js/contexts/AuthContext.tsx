import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'unit_leader' | 'member';

export interface User {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    unit?: string;
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string, role: UserRole) => Promise<boolean>;
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

    // Mock login function - in real app this would call your API
    const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock user data based on role
        const mockUsers = {
            admin: {
                id: 1,
                name: 'Admin User',
                email: email,
                role: 'admin' as UserRole,
                avatar: null,
            },
            unit_leader: {
                id: 2,
                name: 'Unit Leader',
                email: email,
                role: 'unit_leader' as UserRole,
                unit: 'Unit A',
                avatar: null,
            },
            member: {
                id: 3,
                name: 'Member User',
                email: email,
                role: 'member' as UserRole,
                unit: 'Unit A',
                avatar: null,
            },
        };

        const mockUser = mockUsers[role];
        
        if (mockUser) {
            setUser(mockUser);
            localStorage.setItem('koabiga_user', JSON.stringify(mockUser));
            setLoading(false);
            return true;
        }
        
        setLoading(false);
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('koabiga_user');
    };

    // Check for existing session on mount
    useEffect(() => {
        const savedUser = localStorage.getItem('koabiga_user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                setUser(userData);
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                localStorage.removeItem('koabiga_user');
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