import { API_BASE_URL } from "../config";
import type { AlertPreferences, AlertsResponse, MatchExplanation } from "../interfaces/alert";

export const alertService = {
    /**
     * Get scholarship match alerts for the current user
     */
    getMyAlerts: async (
        token: string,
        filters?: { unread_only?: boolean; page?: number; limit?: number }
    ): Promise<AlertsResponse> => {
        const params = new URLSearchParams();
        if (filters?.unread_only) params.append('unread_only', 'true');
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
     * TODO: Backend endpoint DELETE /api/alerts/{id} doesn't exist yet
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    dismissAlert: async (_token: string, _alertId: number): Promise<void> => {
        console.warn('dismissAlert: Backend endpoint not implemented yet');
        throw new Error('Not implemented: DELETE /api/alerts/{id} endpoint does not exist');
    },

    /**
     * Get match explanation for a specific scholarship
     * TODO: Backend endpoint GET /api/scholarships/{id}/match-explanation doesn't exist yet
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getMatchExplanation: async (_token: string, _scholarshipId: number): Promise<MatchExplanation> => {
        console.warn('getMatchExplanation: Backend endpoint not implemented yet');
        throw new Error('Not implemented: GET /api/scholarships/{id}/match-explanation endpoint does not exist');
    },

    /**
     * Get user's alert preferences
     * TODO: Backend endpoint GET /api/profile/alert-preferences doesn't exist yet
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getAlertPreferences: async (_token: string): Promise<AlertPreferences> => {
        console.warn('getAlertPreferences: Backend endpoint not implemented yet');
        throw new Error('Not implemented: GET /api/profile/alert-preferences endpoint does not exist');
    },

    /**
     * Update user's alert preferences
     * TODO: Backend endpoint PATCH /api/profile/alert-preferences doesn't exist yet
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateAlertPreferences: async (_token: string, _preferences: AlertPreferences): Promise<void> => {
        console.warn('updateAlertPreferences: Backend endpoint not implemented yet');
        throw new Error('Not implemented: PATCH /api/profile/alert-preferences endpoint does not exist');
    }
};

export default alertService;
