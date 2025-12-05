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

const mapServerToClient = (payload: any): NotificationData => {
    // Server emits: id, type, title, message, priority, action_url, metadata, created_at, timestamp
    // Normalize to UI type; preserve server type in data.server_type
    const uiType: UiType =
        payload.type === 'application_approved' ? 'success' :
            payload.type === 'application_denied' ? 'error' :
                payload.type === 'system_announcement' ? 'info' :
                    payload.type === 'scholarship_recommended' ? 'success' :
                        payload.type === 'scholarship_match' ? 'success' :
                            ['urgent', 'high'].includes(payload.priority) ? 'warning' : 'info';

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

    // Helper: update state with dedupe and cap to 200 items
    const upsertNotifications = (incoming: NotificationData | NotificationData[]) => {
        const list = Array.isArray(incoming) ? incoming : [incoming];
        setNotifications(prev => {
            const seen = new Set(prev.map(n => n.id));
            const merged = [...list.filter(n => !seen.has(n.id)), ...prev];
            return merged.slice(0, 200);
        });
    };

    // Fetch initial notifications and unread count
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
                    // Append at the end to preserve order when paginating
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
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 8000,
            });

            newSocket.on('connect', () => {
                setIsConnected(true);
                setSocket(newSocket);
                // Join room based on user id so server can emit to room(user_id)
                try {
                    newSocket.emit('join', String(user.id));
                } catch (e) {
                    console.warn('Failed to join room:', e);
                }
                // Initial sync
                refresh();
            });

            newSocket.on('disconnect', (reason) => {
                setIsConnected(false);
                console.log('Socket disconnected:', reason);
            });

            newSocket.on('connect_error', (error) => {
                setIsConnected(false);
                console.error('Socket connection error:', error);
            });

            // Specific channels normalized to the same flow
            newSocket.on('application_status_changed', (data) => {
                const message = `Your application has been ${data.status}`;
                const mapped = mapServerToClient({ ...data, message });
                upsertNotifications(mapped);
                setUnreadCount(prev => prev + 1);
                const toastType: UiType = data.status === 'approved' ? 'success' : data.status === 'denied' ? 'error' : 'info';
                toastType === 'success' ? notyf.success(message)
                    : toastType === 'error' ? notyf.error(message)
                        : notyf.open({ type: 'info', message });
            });

            newSocket.on('scholarship_recommended', (data) => {
                const name = data.scholarship_name || data?.metadata?.scholarship_name || 'a scholarship';
                const message = `You've been recommended for ${name}!`;
                const mapped = mapServerToClient({ ...data, message });
                upsertNotifications(mapped);
                setUnreadCount(prev => prev + 1);
                notyf.success(message);
            });

            // New scholarship match alert
            newSocket.on('new_scholarship_match', (data) => {
                const name = data.scholarship_name || 'a scholarship';
                const score = data.match_score || data.score || 0;
                const message = `New Scholarship Match: ${name} - ${score}% match!`;
                const mapped = mapServerToClient({ 
                    ...data, 
                    message,
                    type: 'scholarship_match',
                    title: 'New Scholarship Match!'
                });
                upsertNotifications(mapped);
                setUnreadCount(prev => prev + 1);
                notyf.success(message);
            });

            newSocket.on('system_announcement', (data) => {
                const message = data.message || 'New system announcement';
                const mapped = mapServerToClient({ ...data, message });
                upsertNotifications(mapped);
                setUnreadCount(prev => prev + 1);
                notyf.open({ type: 'info', message });
            });

            // Admin-only channels
            if (user.role === 'admin') {
                newSocket.on('new_application_submitted', (data) => {
                    const message = `New application submitted by ${data.student_name || 'a student'}`;
                    const mapped = mapServerToClient({ ...data, message });
                    upsertNotifications(mapped);
                    setUnreadCount(prev => prev + 1);
                    notyf.open({ type: 'info', message });
                });

                newSocket.on('application_requires_review', (data) => {
                    const message = `Application #${data.application_id} requires review`;
                    const mapped = mapServerToClient({ ...data, message, priority: 'high' });
                    upsertNotifications(mapped);
                    setUnreadCount(prev => prev + 1);
                    notyf.open({ type: 'warning', message });
                });
            }

            return () => {
                newSocket.removeAllListeners();
                newSocket.disconnect();
                setSocket(null);
                setIsConnected(false);
            };
        } else {
            // Clean up on logout
            if (socket) {
                socket.removeAllListeners();
                socket.disconnect();
                setSocket(null);
            }
            setIsConnected(false);
            setNotifications([]);
            setUnreadCount(0);
            currentPageRef.current = 1;
        }
    }, [isAuthenticated, token, user]); // useAuth handles token refresh and user changes

    const markAsRead = async (notificationId?: string) => {
        if (!token) return;
        try {
            if (notificationId) {
                // Server sync
                await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
                    method: 'PUT',
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Local update
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
            console.error('Error marking notification(s) as read:', err);
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    const sendMessage = (event: string, data: any) => {
        if (socket && isConnected) {
            socket.emit(event, data);
        } else {
            console.warn('Socket not connected. Cannot send message:', event, data);
        }
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
