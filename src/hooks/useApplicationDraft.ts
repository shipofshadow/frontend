import { useCallback, useEffect, useRef, useState } from 'react';
import { API_BASE_URL } from '../config';

interface DraftState {
    lastSaved: Date | null;
    isSaving: boolean;
    hasDraft: boolean;
}

const DEBOUNCE_MS = 30_000; // 30 seconds

export function useApplicationDraft(token: string | null, semesterId: number | string | null) {
    const [state, setState] = useState<DraftState>({
        lastSaved: null,
        isSaving: false,
        hasDraft: false,
    });
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /** Load draft from Redis on mount. Returns parsed data or null. */
    const loadDraft = useCallback(async (): Promise<Record<string, unknown> | null> => {
        if (!token || !semesterId) return null;
        try {
            const res = await fetch(
                `${API_BASE_URL}/api/application/draft/retrieve?semesterId=${semesterId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!res.ok) return null;
            const data = await res.json();
            if (data && typeof data === 'object') {
                setState(prev => ({ ...prev, hasDraft: true }));
                return data as Record<string, unknown>;
            }
            return null;
        } catch {
            return null;
        }
    }, [token, semesterId]);

    /** Immediately save formData to Redis. */
    const saveDraftNow = useCallback(async (formData: Record<string, unknown>) => {
        if (!token || !semesterId) return;
        setState(prev => ({ ...prev, isSaving: true }));
        try {
            await fetch(`${API_BASE_URL}/api/application/draft/save`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ ...formData, semesterId }),
            });
            setState(prev => ({ ...prev, isSaving: false, lastSaved: new Date(), hasDraft: true }));
        } catch {
            setState(prev => ({ ...prev, isSaving: false }));
        }
    }, [token, semesterId]);

    /**
     * Schedule a debounced save. Call on every formData change.
     * A save fires 30s after the last call.
     */
    const scheduleSave = useCallback((formData: Record<string, unknown>) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            saveDraftNow(formData);
        }, DEBOUNCE_MS);
    }, [saveDraftNow]);

    /** Clear draft from Redis after successful submission. */
    const clearDraft = useCallback(async () => {
        if (!token || !semesterId) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        try {
            await fetch(
                `${API_BASE_URL}/api/application/draft/clear?semesterId=${semesterId}`,
                { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
            );
            setState({ lastSaved: null, isSaving: false, hasDraft: false });
        } catch {
            // Non-fatal — draft expires via Redis TTL
        }
    }, [token, semesterId]);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    return {
        ...state,
        loadDraft,
        scheduleSave,
        clearDraft,
        saveDraftNow,
    };
}
