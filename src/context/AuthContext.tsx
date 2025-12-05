import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from "../config";
import SessionModal from "../components/SessionModal";
import { isTokenExpiredSoon } from "../utils/jwt";
import type { ApplicationData, StudentInfo, SummaryStatistics } from "../interfaces/scholarship_summary.ts";
import type User from "../types/user.ts";


interface ScholarshipSummaryResponse {
    student_info: StudentInfo;
    summary_statistics: SummaryStatistics;
    applications: ApplicationData[];
    generated_at: string;
}

interface AuthData {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    applications: ScholarshipSummaryResponse | null;
    login: (user: User, token: string, refreshToken: string, applicationData?: ScholarshipSummaryResponse) => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    fetchScholarshipSummary: () => Promise<void>;
    isAdmin: boolean;
    isStudent: boolean;
    isBitress: boolean;
    isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthData | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [applications, setApplications] = useState<ScholarshipSummaryResponse | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState<boolean>(!!token);
    const [sessionExpired, setSessionExpired] = useState<boolean>(false);

    const isAdmin = user?.role === "admin" || user?.role === "super_admin" || user?.role === "bitress";
    const isStudent = user?.role === "student";
    const isBitress = user?.role === "bitress";
    const isSuperAdmin = user?.role === "super_admin" || user?.role === "bitress";

    const logout = useCallback(() => {
        setUser(null);
        setApplications(null);
        setToken(null);
        setIsLoading(false);
        setSessionExpired(false);
        try {
            localStorage.removeItem('token');
            localStorage.removeItem('refresh_token');
        } catch { /* empty */ }
    }, []);

    const fetchScholarshipSummary = useCallback(async () => {
        if (!token) return;

        try {
            setIsLoading(true);

            const response = await fetch(`${API_BASE_URL}/api/profile/scholarship/summary?active_only=false`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setSessionExpired(true);
                    logout();
                    return;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result: ScholarshipSummaryResponse = await response.json();
            setApplications(result);
        } catch (err) {
            console.error('Error fetching scholarship summary:', err);
        } finally {
            setIsLoading(false);
        }
    }, [token, logout]);

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

            if (!res.ok) {
                if (res.status === 401) {
                    setSessionExpired(true);
                }
                throw new Error("Invalid token");
            }

            const userData = await res.json();
            setUser(userData);

            // Only fetch scholarship summary for students after user is set
            if (userData.role === 'student') {
                await fetchScholarshipSummary();
            }
        } catch (err) {
            console.error('Error fetching user:', err);
            logout();
        } finally {
            setIsLoading(false);
        }
    }, [token, logout, fetchScholarshipSummary]);

    // Initial fetch when component mounts or token changes
    useEffect(() => {
        if (token) {
            fetchUser();
        } else {
            setIsLoading(false);
        }
    }, [token, fetchUser]);

    // Background token refresh
    useEffect(() => {
        if (!token) return;

        const interval = setInterval(async () => {
            const refreshToken = localStorage.getItem("refresh_token");
            if (!refreshToken) return;

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
                } catch (err) {
                    console.error('Token refresh failed:', err);
                    setSessionExpired(true);
                    logout();
                }
            }
        }, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [token, logout]);

    const login = useCallback((
        userData: User,
        accessToken: string,
        refreshToken: string,
        applicationData?: ScholarshipSummaryResponse
    ) => {
        setUser(userData);
        setToken(accessToken);
        if (applicationData) {
            setApplications(applicationData);
        }

        try {
            localStorage.setItem("token", accessToken);
            localStorage.setItem("refresh_token", refreshToken);
        } catch (err) {
            console.error('Error storing tokens:', err);
        }
    }, []);

    const refreshUser = useCallback(async () => {
        await fetchUser();
    }, [fetchUser]);

    const value: AuthData = {
        user,
        token,
        applications,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        refreshUser,
        fetchScholarshipSummary,
        isAdmin,
        isStudent,
        isBitress,
        isSuperAdmin
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