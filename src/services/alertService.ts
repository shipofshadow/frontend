import { API_BASE_URL } from "../config";
import type { AlertPreferences, AlertsResponse, MatchExplanation } from "../interfaces/alert";

export const alertService = {
    /**
     * Get scholarship match alerts for the current user
     */
    getMyAlerts: async (
        token: string,
        filters?: { status?: 'all' | 'unread' | 'read'; min_score?: number; page?: number; limit?: number }
    ): Promise<AlertsResponse> => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.min_score) params.append('min_score', String(filters.min_score));
        if (filters?.page) params.append('page', String(filters.page));
        if (filters?.limit) params.append('limit', String(filters.limit));
        
        const response = await fetch(`${API_BASE_URL}/api/alerts/my-scholarship-matches?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch alerts');
        }
        
        return response.json();
    },

    /**
     * Mark an alert as read
     */
    markAsRead: async (token: string, alertId: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/api/alerts/${alertId}/mark-read`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to mark alert as read');
        }
    },

    /**
     * Dismiss/delete an alert
     */
    dismissAlert: async (token: string, alertId: number): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/api/alerts/${alertId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to dismiss alert');
        }
    },

    /**
     * Get match explanation for a specific scholarship
     */
    getMatchExplanation: async (token: string, scholarshipId: number): Promise<MatchExplanation> => {
        const response = await fetch(`${API_BASE_URL}/api/scholarships/${scholarshipId}/match-explanation`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch match explanation');
        }
        
        const data = await response.json();
        return data.data || data;
    },

    /**
     * Get user's alert preferences
     */
    getAlertPreferences: async (token: string): Promise<AlertPreferences> => {
        const response = await fetch(`${API_BASE_URL}/api/profile/alert-preferences`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch alert preferences');
        }
        
        const data = await response.json();
        return data.data || data;
    },

    /**
     * Update user's alert preferences
     */
    updateAlertPreferences: async (token: string, preferences: AlertPreferences): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/api/profile/alert-preferences`, {
            method: 'PATCH',
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(preferences)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update alert preferences');
        }
    }
};

export default alertService;
