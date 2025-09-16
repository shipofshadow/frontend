// src/store/slices/draftThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config';
import type { RootState } from './index';

const debounceMap = new Map<string, any>();
const debounce = (key: string, fn: () => void, ms = 600) => {
    clearTimeout(debounceMap.get(key));
    const t = setTimeout(fn, ms);
    debounceMap.set(key, t);
};

// Create async thunk for syncing draft
export const syncDraftToServer = createAsyncThunk<
    void,
    { token: string },
    { state: RootState }
>(
    'applicationForm/syncDraft',
    async ({ token }, { getState }) => {
        const state = getState();
        const data = state.applicationForm.data;
        const semesterId = data.semesterId;

        if (!semesterId || !token) return;

        return new Promise<void>((resolve) => {
            debounce(`draft:${semesterId}`, async () => {
                try {
                    await fetch(`${API_BASE_URL}/api/application/draft/save`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ ...data, semesterId }),
                    });
                } catch (error) {
                    console.warn('Failed to sync draft:', error);
                }
                resolve();
            });
        });
    }
);

// Regular async function for clearing draft
export const clearDraftOnServer = async (semesterId: number, token: string) => {
    try {
        await fetch(`${API_BASE_URL}/api/application/draft/?semester_id=${semesterId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (error) {
        console.warn('Failed to clear draft:', error);
    }
};