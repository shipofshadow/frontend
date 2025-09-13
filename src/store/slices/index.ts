import { configureStore } from '@reduxjs/toolkit';
import semesterSlice from "./semesterSlice.ts";
export const store = configureStore({
    reducer: {
        semester: semesterSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
