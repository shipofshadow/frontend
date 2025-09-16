// src/store/slices/index.ts
import { configureStore } from '@reduxjs/toolkit';
import semesterSlice from './semesterSlice';
import applicationFormSlice from './applicationFormSlice';

export const makeDraftKey = (userId?: number | string, semesterId?: number | string) =>
    `ischolar:apply:${userId ?? 'anon'}:${semesterId ?? 'term'}`;

// Light localStorage persist only (no hooks here)
const localPersistMiddleware = () => (storeAPI: any) => (next: any) => (action: any) => {
    const result = next(action);
    if (action.type.startsWith('applicationForm/')) {
        try {
            const state = storeAPI.getState().applicationForm.data;
            // pick a generic key; component can also save with user+semester-specific key
            localStorage.setItem('ischolar:apply:latest', JSON.stringify(state));
        } catch (e) {
            // ignore storage errors
        }
    }
    return result;
};

export const store = configureStore({
    reducer: {
        semester: semesterSlice,
        applicationForm: applicationFormSlice,
    },
    middleware: (getDefault) => getDefault().concat(localPersistMiddleware() as any),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;