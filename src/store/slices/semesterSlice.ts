import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {API_BASE_URL} from "../../config.ts";

export const fetchSemester = createAsyncThunk(
    'semester/fetch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/active-academic-term`);
            if (!response.ok) throw new Error('Failed to fetch semester');
            const data = await response.json();
            return data.formatted;
        } catch {
            return rejectWithValue("Error fetching semester");
        }
    }
);

interface SemesterState {
    current: string;
    loading: boolean;
    error: string | null;
}

const initialState: SemesterState = {
    current: 'N/A',
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
                state.current = action.payload;
            })
            .addCase(fetchSemester.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.current = 'N/A';
            });
    },
});

export default semesterSlice.reducer;

