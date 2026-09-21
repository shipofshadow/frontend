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

// Storage helper with error handling
const storage = {
    get: (key: string): string | null => {
        try {
            return localStorage.getItem(key);
        } catch {
            console.error(`Failed to read ${key} from localStorage`);
            return null;
        }
    },
    set: (key: string, value: string): boolean => {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (err) {
            console.error(`Failed to write ${key} to localStorage:`, err);
            return false;
        }
    },
    remove: (key: string): boolean => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (err) {
            console.error(`Failed to remove ${key} from localStorage:`, err);
            return false;
        }
    }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [applications, setApplications] = useState<ScholarshipSummaryResponse | null>(null);
    const [token, setToken] = useState<string | null>(() => storage.get("token"));
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sessionExpired, setSessionExpired] = useState<boolean>(false);

    // Track in-flight operations to prevent duplicates
    const refreshInFlight = useRef<Promise<string | null> | null>(null);
    const scholarshipFetchInFlight = useRef<Promise<void> | null>(null);
    const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    // Computed properties
    const isAdmin = user?.role === "admin" || user?.role === "bitress" || user?.role === "faculty";
    const isStudent = user?.role === "student";
    const isBitress = user?.role === "bitress";
    const isFaculty = user?.role === "faculty";
    const userCampusId = user?.campus_id;
    const userCampusName = user?.campus_name;

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, []);

    const logout = useCallback((expired = false) => {
        if (!isMountedRef.current) return;

        setUser(null);
        setApplications(null);
        setToken(null);
        setIsLoading(false);

        if (expired) {
            setSessionExpired(true);
        }

        storage.remove("token");
        storage.remove("refresh_token");

        // Clear in-flight operations
        refreshInFlight.current = null;
        scholarshipFetchInFlight.current = null;
    }, []);

    const persistTokens = useCallback((accessToken: string, refreshToken: string): boolean => {
        setToken(accessToken);
        const tokenStored = storage.set("token", accessToken);
        const refreshStored = storage.set("refresh_token", refreshToken);
        return tokenStored && refreshStored;
    }, []);

    const refreshAccessToken = useCallback(async (): Promise<string | null> => {
        // Return existing in-flight refresh
        if (refreshInFlight.current) {
            return refreshInFlight.current;
        }

        const refreshToken = storage.get("refresh_token");
        if (!refreshToken) {
            return null;
        }

        const promise = (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${refreshToken}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) {
                    throw new Error(`Refresh failed: ${res.status}`);
                }

                const data = await res.json();
                const newToken = data.token;

                if (!newToken) {
                    throw new Error("Refresh returned no token");
                }

                if (isMountedRef.current) {
                    setToken(newToken);
                    storage.set("token", newToken);
                }

                return newToken;
            } catch (err) {
                console.error("Token refresh failed:", err);

                if (isMountedRef.current) {
                    setSessionExpired(true);
                    logout(true);
                }

                return null;
            } finally {
                refreshInFlight.current = null;
            }
        })();

        refreshInFlight.current = promise;
        return promise;
    }, [logout]);

    const fetchWithRetry = useCallback(async <T,>(
        fetchFn: (accessToken: string) => Promise<T>,
        activeToken: string
    ): Promise<T | null> => {
        try {
            return await fetchFn(activeToken);
        } catch (err: any) {
            // Only retry on 401
            if (err?.message === "401") {
                const newToken = await refreshAccessToken();
                if (newToken && isMountedRef.current) {
                    try {
                        return await fetchFn(newToken);
                    } catch (retryErr) {
                        console.error("Retry after refresh failed:", retryErr);
                        if (isMountedRef.current) {
                            setSessionExpired(true);
                            logout(true);
                        }
                    }
                }
            } else {
                console.error("Fetch error (non-auth):", err);
            }
            return null;
        }
    }, [refreshAccessToken, logout]);

    const fetchScholarshipSummary = useCallback(async (tokenOverride?: string) => {
        // Return existing in-flight fetch
        if (scholarshipFetchInFlight.current) {
            return scholarshipFetchInFlight.current;
        }

        const activeToken = tokenOverride || token;
        if (!activeToken || !isMountedRef.current) {
            return;
        }

        const doFetch = async (accessToken: string): Promise<ScholarshipSummaryResponse> => {
            const response = await fetch(
                `${API_BASE_URL}/api/profile/scholarship/summary?active_only=false`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (response.status === 401) throw new Error("401");
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            return response.json() as Promise<ScholarshipSummaryResponse>;
        };

        const promise = (async () => {
            const data = await fetchWithRetry(doFetch, activeToken);
            if (data && isMountedRef.current) {
                setApplications(data);
            }
        })();

        scholarshipFetchInFlight.current = promise;
        promise.finally(() => {
            scholarshipFetchInFlight.current = null;
        });

        return promise;
    }, [token, fetchWithRetry]);

    const fetchUser = useCallback(async () => {
        const doFetch = async (accessToken: string): Promise<User> => {
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
            let activeToken = token;

            // If no valid token, check if there's a stored refresh token
            if (!activeToken || activeToken.split(".").length !== 3) {
                const storedRefresh = storage.get("refresh_token");
                if (!storedRefresh) {
                    setUser(null);
                    setIsLoading(false);
                    return;
                }

                activeToken = await refreshAccessToken();
                if (!activeToken) {
                    setUser(null);
                    setIsLoading(false);
                    return;
                }
            }

            const userData = await fetchWithRetry(doFetch, activeToken);

            if (userData && isMountedRef.current) {
                setUser(userData);

                // Fetch scholarship data for students
                if (userData.role === "student") {
                    await fetchScholarshipSummary(activeToken);
                }
            }
        } catch (err) {
            console.error("Error fetching user:", err);
            // Silent failure for transient errors
        } finally {
            if (isMountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [token, refreshAccessToken, fetchWithRetry, fetchScholarshipSummary]);

    // Initial load on mount
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Background token refresh with single-flight guarantee
    useEffect(() => {
        if (!token) return;

        // Clear any existing timer
        if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
        }

        refreshTimerRef.current = setInterval(() => {
            if (isMountedRef.current && isTokenExpiredSoon(token, 60)) {
                refreshAccessToken().catch(err => {
                    console.error("Background refresh error:", err);
                });
            }
        }, 30000);

        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }
        };
    }, [token, refreshAccessToken]);

    const login = useCallback(
        (userData: User, accessToken: string, refreshToken: string, applicationData?: ScholarshipSummaryResponse) => {
            if (!isMountedRef.current) return;

            setUser(userData);
            if (applicationData) {
                setApplications(applicationData);
            }
            persistTokens(accessToken, refreshToken);
            setSessionExpired(false);
        },
        [persistTokens]
    );

    const refreshUser = useCallback(async () => {
        if (isMountedRef.current) {
            await fetchUser();
        }
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
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};