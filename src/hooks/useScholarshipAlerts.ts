import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import alertService from '../services/alertService';
import type { ScholarshipAlert } from '../interfaces/alert';

interface UseScholarshipAlertsReturn {
    alerts: ScholarshipAlert[];
    unreadAlertCount: number;
    isLoading: boolean;
    error: string | null;
    fetchAlerts: (filters?: { status?: 'all' | 'unread' | 'read'; min_score?: number }) => Promise<void>;
    markAsRead: (alertId: number) => Promise<void>;
    dismissAlert: (alertId: number) => Promise<void>;
    refreshAlerts: () => Promise<void>;
}

export const useScholarshipAlerts = (): UseScholarshipAlertsReturn => {
    const { token } = useAuth();
    const { socket, isConnected } = useNotifications();
    const [alerts, setAlerts] = useState<ScholarshipAlert[]>([]);
    const [unreadAlertCount, setUnreadAlertCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAlerts = useCallback(async (
        filters?: { status?: 'all' | 'unread' | 'read'; min_score?: number }
    ) => {
        if (!token) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await alertService.getMyAlerts(token, filters);
            if (response.success && response.data) {
                setAlerts(response.data.alerts || []);
                setUnreadAlertCount(response.data.unread_count || 0);
            }
        } catch (err) {
            console.error('Error fetching alerts:', err);
            setError('Failed to load scholarship alerts');
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    const refreshAlerts = useCallback(async () => {
        await fetchAlerts();
    }, [fetchAlerts]);

    const markAsRead = useCallback(async (alertId: number) => {
        if (!token) return;
        
        try {
            await alertService.markAsRead(token, alertId);
            setAlerts(prev => prev.map(alert => 
                alert.id === alertId ? { ...alert, is_read: true } : alert
            ));
            setUnreadAlertCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking alert as read:', err);
        }
    }, [token]);

    const dismissAlert = useCallback(async (alertId: number) => {
        if (!token) return;
        
        try {
            // Find the alert before removing it to check if it was unread
            const alertToRemove = alerts.find(a => a.id === alertId);
            const wasUnread = alertToRemove && !alertToRemove.is_read;
            
            await alertService.dismissAlert(token, alertId);
            setAlerts(prev => prev.filter(alert => alert.id !== alertId));
            
            // Update unread count if the dismissed alert was unread
            if (wasUnread) {
                setUnreadAlertCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Error dismissing alert:', err);
        }
    }, [token, alerts]);

    // Initial fetch on mount
    useEffect(() => {
        if (token) {
            fetchAlerts();
        }
    }, [token, fetchAlerts]);

    // Listen for new scholarship match events via WebSocket
    useEffect(() => {
        if (socket && isConnected) {
            const handleNewScholarshipMatch = (data: ScholarshipAlert) => {
                setAlerts(prev => [data, ...prev]);
                setUnreadAlertCount(prev => prev + 1);
            };

            socket.on('new_scholarship_match', handleNewScholarshipMatch);

            return () => {
                socket.off('new_scholarship_match', handleNewScholarshipMatch);
            };
        }
    }, [socket, isConnected]);

    return {
        alerts,
        unreadAlertCount,
        isLoading,
        error,
        fetchAlerts,
        markAsRead,
        dismissAlert,
        refreshAlerts
    };
};

export default useScholarshipAlerts;
