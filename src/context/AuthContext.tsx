import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from "../config";
import SessionModal from "../components/SessionModal";
import { isTokenExpiredSoon } from "../utils/jwt";
import type {Profile} from "../interfaces/profile.ts";
interface User {
    id: number;
    is_active: number;
    role: string;
    username: string;
    profile?: Profile;
    email: string;
}

interface AuthData {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (user: User, token: string, refreshToken: string) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    isAdmin: boolean;
    isStudent: boolean;
}


const AuthContext = createContext<AuthData | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState<boolean>(!!token);
    const [sessionExpired, setSessionExpired] = useState<boolean>(false);

    const isAdmin = user?.role === "admin";
    const isStudent = user?.role === "student";

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        setSessionExpired(false);
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
        } catch { /* empty */ }
    }, []);

    const fetchUser = useCallback(async () => {
        if (!token || token.split('.').length !== 3) {
            logout();
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
            
            if (!res.ok) throw new Error("Invalid token");

            const userData = await res.json();
            setUser(userData);
        } catch {
            logout();
        } finally {
            setIsLoading(false);
        }
    }, [token, logout]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // 🔁 Background Refresh Token
    useEffect(() => {
        const interval = setInterval(async () => {
            const refreshToken = localStorage.getItem("refresh_token");
            if (!token || !refreshToken) return;

            if (isTokenExpiredSoon(token, 60)) {
                try {
                    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${refreshToken}`,
                            "Content-Type": "application/json"
                        },
                    });

                    if (!res.ok) throw new Error("Refresh failed");

                    const data = await res.json();
                    const newToken = data.token;
                    setToken(newToken);
                    localStorage.setItem("token", newToken);
                } catch {
                    setSessionExpired(true);
                    logout();
                }
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [token, logout]);

    const login = useCallback((userData: User, accessToken: string, refreshToken: string) => {
        setUser(userData);
        setToken(accessToken);
        try {
            localStorage.setItem("token", accessToken);
            localStorage.setItem("refresh_token", refreshToken);
        } catch { /* empty */ }
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
        isAdmin,
        isStudent
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            {sessionExpired && <SessionModal />}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
