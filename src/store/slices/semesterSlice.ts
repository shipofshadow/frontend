import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from "../../config.ts";
import type {RootState} from "./index.ts";

// Async thunk to fetch the active academic term
export const fetchSemester = createAsyncThunk(
    'semester/fetchSemester',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/active-academic-term`);
            if (!response.ok) throw new Error('Failed to fetch semester');
            const data = await response.json();
            return {
                formatted: data.formatted,
                semesterId: data.semester_id,
            };
        } catch {
            return rejectWithValue("Error fetching semester");
        }
    }
);

interface SemesterState {
    current: string;
    semesterId: number | null;
    loading: boolean;
    error: string | null;
}

const initialState: SemesterState = {
    current: 'N/A',
    semesterId: null,
    loading: false,
    error: null,
};

const semesterSlice = createSlice({
    name: 'semester',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSemester.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchSemester.fulfilled, (state, action) => {
                state.loading = false;
                state.current = action.payload.formatted;
                state.semesterId = action.payload.semesterId;
            })
            .addCase(fetchSemester.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.current = 'N/A';
                state.semesterId = null;
            });
    },
});
export const selectSemester = (state: RootState) => state.semester.current;
export const selectSemesterId = (state: RootState) => state.semester.semesterId;
export default semesterSlice.reducer;
