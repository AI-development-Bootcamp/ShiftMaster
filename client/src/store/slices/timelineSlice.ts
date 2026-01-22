import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/api';

// Types matching the API response structure from design.md
export interface EntryAssignment {
    entry_assignment_id: number;
    task_id: number;
    task_name: string;
    project_name: string;
    location: string;
    duration_minutes: number;
}

export interface WorkEntry {
    entry_id: number;
    entry_kind: 'work';
    start_time: string;
    end_time: string | null;
    assignments: EntryAssignment[];
    is_active?: boolean; // true if end_time is null
    is_locked?: boolean; // true if in locked month
}

export interface AbsenceEntry {
    entry_id: number;
    entry_kind: 'absence';
    absence_type: string;
    start_time: string | null;
    end_time: string | null;
    description?: string;
}

export interface TimelineDay {
    work_date: string;
    total_work_minutes: number;
    entries: WorkEntry[];
    absences: AbsenceEntry[];
    isExpanded: boolean; // UI state for day card
}

interface TimelineState {
    timeline: TimelineDay[];
    loading: boolean;
    error: string | null;
}

const initialState: TimelineState = {
    timeline: [],
    loading: false,
    error: null,
};

// API response type
interface TimelineApiResponse {
    timeline: Array<{
        work_date: string;
        total_work_minutes: number;
        entries: WorkEntry[];
        absences: AbsenceEntry[];
    }>;
}

// Async thunk to fetch timeline
export const fetchTimeline = createAsyncThunk<
    TimelineDay[],
    { startDate?: string; endDate?: string; userId?: string },
    { rejectValue: { code: string; message: string } }
>('timeline/fetch', async ({ startDate, endDate, userId }, { rejectWithValue }) => {
    try {
        // Build query params
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (userId) params.append('user_id', userId);

        const queryString = params.toString();
        const url = `/entries/timeline${queryString ? `?${queryString}` : ''}`;

        const response = await apiClient.get<TimelineApiResponse>(url);

        // Transform API response to include UI state
        return response.timeline.map((day) => ({
            ...day,
            isExpanded: false, // Default to collapsed
        }));
    } catch (error) {
        const err = error as { code?: string; message?: string };
        return rejectWithValue({
            code: err.code || 'TIMELINE_FETCH_ERROR',
            message: err.message || 'Failed to fetch timeline',
        });
    }
});

const timelineSlice = createSlice({
    name: 'timeline',
    initialState,
    reducers: {
        // Toggle expanded state for a specific day
        toggleDayExpanded: (state, action: PayloadAction<string>) => {
            const workDate = action.payload;
            const day = state.timeline.find((d) => d.work_date === workDate);
            if (day) {
                day.isExpanded = !day.isExpanded;
            }
        },
        // Expand a specific day
        expandDay: (state, action: PayloadAction<string>) => {
            const workDate = action.payload;
            const day = state.timeline.find((d) => d.work_date === workDate);
            if (day) {
                day.isExpanded = true;
            }
        },
        // Collapse a specific day
        collapseDay: (state, action: PayloadAction<string>) => {
            const workDate = action.payload;
            const day = state.timeline.find((d) => d.work_date === workDate);
            if (day) {
                day.isExpanded = false;
            }
        },
        // Collapse all days
        collapseAllDays: (state) => {
            state.timeline.forEach((day) => {
                day.isExpanded = false;
            });
        },
        // Clear timeline data
        clearTimeline: (state) => {
            state.timeline = [];
            state.error = null;
        },
        // Clear any errors
        clearError: (state) => {
            state.error = null;
        },
        // Set timeline directly (for optimistic updates)
        setTimeline: (state, action: PayloadAction<TimelineDay[]>) => {
            state.timeline = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTimeline.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTimeline.fulfilled, (state, action) => {
                state.loading = false;
                state.timeline = action.payload;
            })
            .addCase(fetchTimeline.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to fetch timeline';
            });
    },
});

export const {
    toggleDayExpanded,
    expandDay,
    collapseDay,
    collapseAllDays,
    clearTimeline,
    clearError,
    setTimeline,
} = timelineSlice.actions;
export default timelineSlice.reducer;
