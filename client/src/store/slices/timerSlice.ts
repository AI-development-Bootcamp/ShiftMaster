import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '@/api';

// Types
export interface ActiveEntry {
    entry_id: number;
    work_date: string;
    start_time: string;
}

interface TimerState {
    activeEntry: ActiveEntry | null;
    isRunning: boolean;
    elapsedSeconds: number;
    loading: boolean;
    error: string | null;
}

// localStorage key for timer persistence
const TIMER_STORAGE_KEY = 'shiftmaster_active_timer';

// Helper functions for localStorage persistence
const saveTimerToStorage = (entry: ActiveEntry | null) => {
    if (entry) {
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(entry));
    } else {
        localStorage.removeItem(TIMER_STORAGE_KEY);
    }
};

const loadTimerFromStorage = (): ActiveEntry | null => {
    try {
        const stored = localStorage.getItem(TIMER_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as ActiveEntry;
        }
    } catch (error) {
        console.error('[TIMER_STORAGE] Failed to load timer from storage:', error);
        localStorage.removeItem(TIMER_STORAGE_KEY);
    }
    return null;
};

// Calculate elapsed seconds from start_time to now
const calculateElapsedSeconds = (startTime: string): number => {
    const now = new Date();
    const [hours, minutes, seconds] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, seconds, 0);

    const diffMs = now.getTime() - startDate.getTime();
    return Math.max(0, Math.floor(diffMs / 1000));
};

const initialState: TimerState = {
    activeEntry: null,
    isRunning: false,
    elapsedSeconds: 0,
    loading: false,
    error: null,
};

// Async thunk for clock-in
export const clockIn = createAsyncThunk<
    ActiveEntry,
    { workDate: string; startTime: string },
    { rejectValue: { code: string; message: string } }
>('timer/clockIn', async ({ workDate, startTime }, { rejectWithValue }) => {
    try {
        const response = await apiClient.post<{
            entry_id: number;
            user_id: string;
            entry_kind: string;
            work_date: string;
            start_time: string;
            end_time: null;
        }>('/entries/clock-in', {
            work_date: workDate,
            start_time: startTime,
        });

        const entry: ActiveEntry = {
            entry_id: response.entry_id,
            work_date: response.work_date,
            start_time: response.start_time,
        };

        // Persist to localStorage
        saveTimerToStorage(entry);

        return entry;
    } catch (error) {
        const err = error as { code?: string; message?: string };
        return rejectWithValue({
            code: err.code || 'CLOCK_IN_ERROR',
            message: err.message || 'Failed to clock in',
        });
    }
});

// Async thunk for clock-out
export const clockOut = createAsyncThunk<
    void,
    { entryId: number; endTime: string; taskId: number; location: string },
    { rejectValue: { code: string; message: string } }
>(
    'timer/clockOut',
    async ({ entryId, endTime, taskId, location }, { rejectWithValue }) => {
        try {
            await apiClient.patch(`/entries/${entryId}/clock-out`, {
                end_time: endTime,
                task_id: taskId,
                location,
            });

            // Clear localStorage
            saveTimerToStorage(null);
        } catch (error) {
            const err = error as { code?: string; message?: string };
            return rejectWithValue({
                code: err.code || 'CLOCK_OUT_ERROR',
                message: err.message || 'Failed to clock out',
            });
        }
    }
);

// Async thunk to resume timer on app load
export const resumeTimer = createAsyncThunk<
    ActiveEntry | null,
    void,
    { rejectValue: { code: string; message: string } }
>('timer/resume', async (_, { rejectWithValue }) => {
    const storedEntry = loadTimerFromStorage();

    if (!storedEntry) {
        return null;
    }

    try {
        // Verify the entry still exists and is still active (no end_time)
        const response = await apiClient.get<{
            entry_id: number;
            work_date: string;
            start_time: string;
            end_time: string | null;
        }>(`/entries/${storedEntry.entry_id}`);

        if (response.end_time !== null) {
            // Entry was already clocked out, clear storage
            saveTimerToStorage(null);
            return null;
        }

        return {
            entry_id: response.entry_id,
            work_date: response.work_date,
            start_time: response.start_time,
        };
    } catch (error) {
        // Entry not found or error, clear storage
        saveTimerToStorage(null);
        const err = error as { code?: string; message?: string };
        return rejectWithValue({
            code: err.code || 'RESUME_ERROR',
            message: err.message || 'Failed to resume timer',
        });
    }
});

const timerSlice = createSlice({
    name: 'timer',
    initialState,
    reducers: {
        // Update elapsed seconds (called by interval)
        updateElapsed: (state, action: PayloadAction<number>) => {
            state.elapsedSeconds = action.payload;
        },
        // Increment elapsed seconds by 1 (for ticker)
        tickElapsed: (state) => {
            state.elapsedSeconds += 1;
        },
        // Clear any errors
        clearError: (state) => {
            state.error = null;
        },
        // Clear active entry (for local testing/reset)
        clearActiveEntry: (state) => {
            state.activeEntry = null;
            state.isRunning = false;
            state.elapsedSeconds = 0;
            saveTimerToStorage(null);
        },
    },
    extraReducers: (builder) => {
        builder
            // Clock-in cases
            .addCase(clockIn.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clockIn.fulfilled, (state, action) => {
                state.loading = false;
                state.activeEntry = action.payload;
                state.isRunning = true;
                state.elapsedSeconds = calculateElapsedSeconds(action.payload.start_time);
            })
            .addCase(clockIn.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to clock in';
            })
            // Clock-out cases
            .addCase(clockOut.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(clockOut.fulfilled, (state) => {
                state.loading = false;
                state.activeEntry = null;
                state.isRunning = false;
                state.elapsedSeconds = 0;
            })
            .addCase(clockOut.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to clock out';
            })
            // Resume timer cases
            .addCase(resumeTimer.pending, (state) => {
                state.loading = true;
            })
            .addCase(resumeTimer.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload) {
                    state.activeEntry = action.payload;
                    state.isRunning = true;
                    state.elapsedSeconds = calculateElapsedSeconds(action.payload.start_time);
                }
            })
            .addCase(resumeTimer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Failed to resume timer';
            });
    },
});

export const { updateElapsed, tickElapsed, clearError, clearActiveEntry } =
    timerSlice.actions;
export default timerSlice.reducer;
