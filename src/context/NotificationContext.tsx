import React, { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config';
import { notyf } from '../utils/utils';

type UiType = 'success' | 'error' | 'warning' | 'info';

interface NotificationData {
    id: string;
    title?: string;
    message: string;
    type: UiType;
    timestamp: Date;
    read: boolean;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    action_url?: string;
    data?: any;
}

interface NotificationContextType {
    socket: Socket | null;
    isConnected: boolean;
    sendMessage: (event: string, data: any) => void;
    notifications: NotificationData[];
    unreadCount: number;
    markAsRead: (notificationId?: string) => Promise<void>;
    clearNotifications: () => void;
    fetchMore: (page?: number) => Promise<void>;
    refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
    children: ReactNode;
}

// 1. Updated Mapper to handle new backend types
const mapServerToClient = (payload: any): NotificationData => {
    // Determine UI styling based on server type
    let uiType: UiType = 'info';

    switch (payload.type) {
        case 'application_approved':
        case 'scholarship_awarded':
        case 'scholarship_recommended':
            uiType = 'success';
            break;
        case 'application_denied':
            uiType = 'error';
            break;
        case 'application_returned': // New status
            uiType = 'warning';
            break;
        case 'deadline_reminder':
            uiType = 'warning';
            break;
        case 'application_evaluated': // New status
        case 'new_application':
        case 'system_announcement':
        default:
            uiType = 'info';
            break;
    }

    // Override based on priority if generic
    if (['urgent', 'high'].includes(payload.priority) && uiType === 'info') {
        uiType = 'warning';
    }

    return {
        id: String(payload.id ?? payload.notification_id ?? Date.now()),
        title: payload.title,
        message: payload.message || 'New notification',
        type: uiType,
        timestamp: new Date(payload.created_at || payload.timestamp || Date.now()),
        read: Boolean(payload.is_read) || false,
        priority: payload.priority,
        action_url: payload.action_url,
        data: {
            ...payload.metadata,
            server_type: payload.type,
        }
    };
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const { token, isAuthenticated, user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const currentPageRef = useRef<number>(1);
    const isFetchingRef = useRef<boolean>(false);

    const upsertNotifications = (incoming: NotificationData | NotificationData[]) => {
        const list = Array.isArray(incoming) ? incoming : [incoming];
        setNotifications(prev => {
            const seen = new Set(prev.map(n => n.id));
            const merged = [...list.filter(n => !seen.has(n.id)), ...prev];
            return merged.slice(0, 200);
        });
    };

    const refresh = useMemo(() => {
        return async () => {
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/notifications/?page=1&limit=20`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                if (json?.success && json?.data) {
                    const items = (json.data.notifications || []).map(mapServerToClient);
                    setNotifications(items);
                    setUnreadCount(Number(json.data.unread_count || 0));
                    currentPageRef.current = 1;
                }
            } catch (err) {
                console.error('Error refreshing notifications:', err);
            }
        };
    }, [token]);

    const fetchMore = useMemo(() => {
        return async (page?: number) => {
            if (!token || isFetchingRef.current) return;
            isFetchingRef.current = true;
            try {
                const nextPage = page ?? currentPageRef.current + 1;
                const res = await fetch(`${API_BASE_URL}/api/notifications/?page=${nextPage}&limit=20`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                if (json?.success && json?.data) {
                    const items = (json.data.notifications || []).map(mapServerToClient);
                    setNotifications(prev => {
                        const dedup = new Map(prev.map(n => [n.id, n]));
                        for (const n of items) dedup.set(n.id, dedup.get(n.id) ?? n);
                        return Array.from(dedup.values());
                    });
                    currentPageRef.current = nextPage;
                }
            } catch (err) {
                console.error('Error fetching more notifications:', err);
            } finally {
                isFetchingRef.current = false;
            }
        };
    }, [token]);

    // Socket lifecycle
    useEffect(() => {
        if (isAuthenticated && token && user) {
            const newSocket = io(`${API_BASE_URL}`, {
                auth: { token },
                withCredentials: true,
                transports: ['websocket', 'polling'],
                autoConnect: true,
                reconnection: true,
            });

            newSocket.on('connect', () => {
                setIsConnected(true);
                setSocket(newSocket);
                try {
                    newSocket.emit('join', String(user.id));
                } catch (e) {
                    console.warn('Failed to join room:', e);
                }
                refresh();
            });

            newSocket.on('disconnect', () => setIsConnected(false));

            // --- 2. Generic Catch-All Listener ---
            // Handles 'deadline_reminder', 'profile_updated', etc.
            newSocket.on('notification', (data) => {
                const mapped = mapServerToClient(data);
                upsertNotifications(mapped);
                setUnreadCount(prev => prev + 1);

                // Prevent double toast if specific listener handles it
                const specificTypes = [
                    'application_approved', 'application_denied', 'application_returned', 'application_evaluated',
                    'scholarship_recommended', 'new_application', 'system_announcement'
                ];

                if (!specificTypes.includes(data.type)) {
                    notyf.open({ type: mapped.type, message: mapped.message });
                }
            });

            // --- 3. Specific Listeners (Toast Logic) ---

            newSocket.on('application_status_changed', (data) => {
                // Handling approved, denied, returned, evaluated
                const status = data.status; // 'approved', 'denied', 'returned', 'evaluated'
                let message = `Your application has been ${status}`;
                if (status === 'returned') message = 'Action Required: Application returned for revision';

                // Ensure state update happens (idempotent due to upsert)
                const mapped = mapServerToClient({ ...data, message });
                upsertNotifications(mapped);

                // Toast
                if (status === 'approved') notyf.success(message);
                else if (status === 'denied') notyf.error(message);
                else if (status === 'returned') notyf.open({ type: 'warning', message });
                else notyf.open({ type: 'info', message });
            });

            newSocket.on('scholarship_recommended', (data) => {
                const name = data.scholarship_name || data?.metadata?.scholarship_name || 'a scholarship';
                const message = `You've been recommended for ${name}!`;
                const mapped = mapServerToClient({ ...data, message });
                upsertNotifications(mapped);
                notyf.success(message);
            });

            newSocket.on('system_announcement', (data) => {
                const mapped = mapServerToClient(data);
                upsertNotifications(mapped);
                notyf.open({ type: 'info', message: mapped.message });
            });

            // Admin & Faculty Listeners
            if (['admin', 'faculty'].includes(user.role)) {
                newSocket.on('new_application_submitted', (data) => {
                    const message = `New application submitted by ${data.student_name || 'a student'}`;
                    const mapped = mapServerToClient({ ...data, message });
                    upsertNotifications(mapped);
                    notyf.open({ type: 'info', message });
                });
            }

            return () => {
                newSocket.removeAllListeners();
                newSocket.disconnect();
                setSocket(null);
                setIsConnected(false);
            };
        } else {
            // Cleanup on logout
            if (socket) {
                socket.removeAllListeners();
                socket.disconnect();
                setSocket(null);
            }
            setIsConnected(false);
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [isAuthenticated, token, user]);

    const markAsRead = async (notificationId?: string) => {
        if (!token) return;
        try {
            if (notificationId) {
                await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } else {
                await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${token}` }
                });
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                setUnreadCount(0);
            }
        } catch (err) {
            console.error('Error marking read:', err);
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    const sendMessage = (event: string, data: any) => {
        if (socket && isConnected) socket.emit(event, data);
    };

    const contextValue: NotificationContextType = {
        socket,
        isConnected,
        sendMessage,
        notifications,
        unreadCount,
        markAsRead,
        clearNotifications,
        fetchMore,
        refresh,
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

export default NotificationContext;