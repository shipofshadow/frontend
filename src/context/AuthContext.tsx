import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from "../config.ts";

interface User {
    id: number;
    is_active: number;
    role: string;
    username: string;
}

interface AuthData {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthData | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => {
        try {
            return localStorage.getItem('token');
        } catch {
            // Handle cases where localStorage is not available
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState<boolean>(!!token);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        try {
            localStorage.removeItem('token');
        } catch {
            // Handle localStorage errors silently
        }
    }, []);

    const fetchUser = useCallback(async () => {
        if (!token || token.split('.').length !== 3) {
            console.warn('Missing or invalid token');
            logout();
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/profile/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            const userData = await res.json();
            setUser(userData);
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    }, [token, logout]);


    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const login = useCallback((userData: User, authToken: string) => {
        setUser(userData);
        setToken(authToken);
        try {
            localStorage.setItem('token', authToken);
        } catch {
            // Handle localStorage errors silently
        }
    }, []);

    const refreshUser = useCallback(async () => {
        await fetchUser();
    }, [fetchUser]);

    const value: AuthData = {
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used inside AuthProvider");
    }
    return ctx;
};