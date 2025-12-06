import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { API_BASE_URL } from "../config";
import SessionModal from "../components/SessionModal";
import { isTokenExpiredSoon } from "../utils/jwt";
import type { ApplicationData, StudentInfo, SummaryStatistics } from "../interfaces/scholarship_summary";
import type User from "../types/user";

type ScholarshipSummaryResponse = {
    student_info: StudentInfo;
    summary_statistics: SummaryStatistics;
    applications: ApplicationData[];
    generated_at: string;
};

type AuthData = {
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
    isFaculty: boolean;
    userCampusId: number | undefined;
    userCampusName: string | undefined;
};

const AuthContext = createContext<AuthData | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [applications, setApplications] = useState<ScholarshipSummaryResponse | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sessionExpired, setSessionExpired] = useState<boolean>(false);

    const refreshInFlight = useRef<Promise<string | null> | null>(null);

    const isAdmin = user?.role === "admin" || user?.role === "bitress" || user?.role === "faculty";
    const isStudent = user?.role === "student";
    const isBitress = user?.role === "bitress";
    const isFaculty = user?.role === "faculty";
    const userCampusId = user?.campus_id;
    const userCampusName = user?.campus_name;

    const logout = useCallback(() => {
        setUser(null);
        setApplications(null);
        setToken(null);
        setIsLoading(false);
        setSessionExpired(false);
        try {
            localStorage.removeItem("token");
            localStorage.removeItem("refresh_token");
        } catch { /* no-op */ }
    }, []);

    const persistTokens = (accessToken: string, refreshToken: string) => {
        setToken(accessToken);
        try {
            localStorage.setItem("token", accessToken);
            localStorage.setItem("refresh_token", refreshToken);
        } catch (err) {
            console.error("Error storing tokens:", err);
        }
    };

    const refreshAccessToken = useCallback(async (): Promise<string | null> => {
        if (refreshInFlight.current) return refreshInFlight.current;

        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) return null;

        const promise = (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${refreshToken}`,
                        "Content-Type": "application/json",
                    },
                });
                if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
                const data = await res.json();
                const newToken = data.token;
                if (newToken) {
                    setToken(newToken);
                    localStorage.setItem("token", newToken);
                    return newToken;
                }
                throw new Error("Refresh returned no token");
            } catch (err) {
                console.error("Token refresh failed:", err);
                setSessionExpired(true);
                logout();
                return null;
            } finally {
                refreshInFlight.current = null;
            }
        })();

        refreshInFlight.current = promise;
        return promise;
    }, [logout]);

    const fetchScholarshipSummary = useCallback(async () => {
        if (!token) return;
        const doFetch = async (accessToken: string) => {
            const response = await fetch(
                `${API_BASE_URL}/api/profile/scholarship/summary?active_only=false`,
                { headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } }
            );
            if (response.status === 401) throw new Error("401");
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json() as Promise<ScholarshipSummaryResponse>;
        };

        try {
            const data = await doFetch(token);
            setApplications(data);
        } catch (err: any) {
            if (err?.message === "401") {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    try {
                        const data = await doFetch(newToken);
                        setApplications(data);
                        return;
                    } catch (err2) {
                        console.error("Retry failed:", err2);
                    }
                }
                setSessionExpired(true);
                logout();
            } else {
                // Non-auth errors: keep session, just log
                console.error("Error fetching scholarship summary:", err);
            }
        }
    }, [token, logout, refreshAccessToken]);

    const fetchUser = useCallback(async () => {
        const doFetch = async (accessToken: string) => {
            const res = await fetch(`${API_BASE_URL}/api/profile/me`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },

            });
            if (res.status === 401) throw new Error("401");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json() as Promise<User>;
        };

        try {
            if (!token || token.split(".").length !== 3) {
                // try refresh-based rehydrate
                const refreshed = await refreshAccessToken();
                if (!refreshed) throw new Error("No valid token");
                const userData = await doFetch(refreshed);
                setUser(userData);
                if (userData.role === "student") await fetchScholarshipSummary();
                return;
            }

            const userData = await doFetch(token);
            setUser(userData);
            if (userData.role === "student") await fetchScholarshipSummary();
        } catch (err: any) {
            if (err?.message === "401") {
                const newToken = await refreshAccessToken();
                if (newToken) {
                    try {
                        const userData = await doFetch(newToken);
                        setUser(userData);
                        if (userData.role === "student") await fetchScholarshipSummary();
                        return;
                    } catch (err2) {
                        console.error("Retry after refresh failed:", err2);
                    }
                }
                setSessionExpired(true);
                logout();
            } else {
                console.error("Error fetching user:", err);
                // Do not logout on transient/network failures
            }
        } finally {
            setIsLoading(false);
        }
    }, [token, logout, refreshAccessToken, fetchScholarshipSummary]);

    // Initial load / rehydrate
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Background token refresh (single-flight, only when expiring soon)
    useEffect(() => {
        if (!token) return;
        const interval = setInterval(() => {
            if (isTokenExpiredSoon(token, 60)) {
                refreshAccessToken().catch(() => {/* handled in helper */});
            }
        }, 30000);
        return () => clearInterval(interval);
    }, [token, refreshAccessToken]);

    const login = useCallback(
        (userData: User, accessToken: string, refreshToken: string, applicationData?: ScholarshipSummaryResponse) => {
            setUser(userData);
            if (applicationData) setApplications(applicationData);
            persistTokens(accessToken, refreshToken);
        },
        []
    );

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
        isFaculty,
        userCampusId,
        userCampusName,
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
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};