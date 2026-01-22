/**
 * Redux slice for time entries management
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type {
    WorkEntryResponse,
    AbsenceEntryResponse,
    CreateWorkEntryRequest,
    CreateAbsenceEntryRequest,
} from '@abra-shift-master/shared';
import { apiClient } from '@/api';

interface EntriesState {
    // Work entries indexed by date (YYYY-MM-DD)
    workEntries: Record<string, WorkEntryResponse>;
    // Absence entries indexed by date (YYYY-MM-DD)
    absenceEntries: Record<string, AbsenceEntryResponse>;
    // Loading states
    loading: boolean;
    creating: boolean;
    // Error state
    error: { code: string; message: string } | null;
    // Currently loaded month
    loadedMonth: { year: number; month: number } | null;
}

const initialState: EntriesState = {
    workEntries: {},
    absenceEntries: {},
    loading: false,
    creating: false,
    error: null,
    loadedMonth: null,
};

/**
 * Fetch entries for a specific month
 */
export const fetchEntriesByMonth = createAsyncThunk<
    { workEntries: WorkEntryResponse[]; absenceEntries: AbsenceEntryResponse[]; year: number; month: number },
    { year: number; month: number },
    { rejectValue: { code: string; message: string } }
>('entries/fetchByMonth', async ({ year, month }, { rejectWithValue }) => {
    try {
        // Fetch work entries
        const workResult = await apiClient.get<{ entries: WorkEntryResponse[] }>(
            `/time-entries?year=${year}&month=${month}`
        );

        // Fetch absence entries
        const absenceResult = await apiClient.get<{ absences: AbsenceEntryResponse[] }>(
            `/absences?year=${year}&month=${month}`
        );

        return {
            workEntries: workResult.entries,
            absenceEntries: absenceResult.absences,
            year,
            month,
        };
    } catch (err) {
        const error = parseApiError(err);
        return rejectWithValue(error);
    }
});

/**
 * Create a work entry
 */
export const createWorkEntry = createAsyncThunk<
    { entry: WorkEntryResponse },
    CreateWorkEntryRequest,
    { rejectValue: { code: string; message: string; details?: unknown } }
>('entries/createWork', async (entryData, { rejectWithValue }) => {
    try {
        const result = await apiClient.post<{ entry: WorkEntryResponse }>(
            '/time-entries',
            entryData
        );
        return result;
    } catch (err) {
        const error = parseApiError(err);
        return rejectWithValue(error);
    }
});

/**
 * Create an absence entry
 */
export const createAbsenceEntry = createAsyncThunk<
    { entries: AbsenceEntryResponse[] },
    CreateAbsenceEntryRequest,
    { rejectValue: { code: string; message: string; details?: unknown } }
>('entries/createAbsence', async (absenceData, { rejectWithValue }) => {
    try {
        const result = await apiClient.post<{ entries: AbsenceEntryResponse[] }>(
            '/absences',
            absenceData
        );
        return result;
    } catch (err) {
        const error = parseApiError(err);
        return rejectWithValue(error);
    }
});

/**
 * Parse API errors
 */
function parseApiError(err: unknown): { code: string; message: string; details?: unknown } {
    if (isAxiosError(err) && err.response?.data?.error) {
        const apiError = err.response.data.error;
        return {
            code: apiError.code || 'INTERNAL_SERVER_ERROR',
            message: apiError.message || 'An unexpected error occurred',
            details: apiError.details,
        };
    }

    if (isAxiosError(err) && !err.response) {
        return {
            code: 'NETWORK_ERROR',
            message: 'Network error - please check your connection',
        };
    }

    return {
        code: 'INTERNAL_SERVER_ERROR',
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
    };
}

function isAxiosError(error: unknown): error is {
    response?: { data?: { error?: { code?: string; message?: string; details?: unknown } } };
} {
    return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}

const entriesSlice = createSlice({
    name: 'entries',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearEntries: (state) => {
            state.workEntries = {};
            state.absenceEntries = {};
            state.loadedMonth = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch entries
            .addCase(fetchEntriesByMonth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEntriesByMonth.fulfilled, (state, action) => {
                state.loading = false;
                state.loadedMonth = { year: action.payload.year, month: action.payload.month };

                // Index work entries by date
                state.workEntries = {};
                for (const entry of action.payload.workEntries) {
                    state.workEntries[entry.work_date] = entry;
                }

                // Index absence entries by date
                state.absenceEntries = {};
                for (const entry of action.payload.absenceEntries) {
                    state.absenceEntries[entry.work_date] = entry;
                }
            })
            .addCase(fetchEntriesByMonth.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || { code: 'UNKNOWN', message: 'Unknown error' };
            })

            // Create work entry
            .addCase(createWorkEntry.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createWorkEntry.fulfilled, (state, action) => {
                state.creating = false;
                // Add/update the entry in state
                const entry = action.payload.entry;
                state.workEntries[entry.work_date] = entry;
            })
            .addCase(createWorkEntry.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload || { code: 'UNKNOWN', message: 'Unknown error' };
            })

            // Create absence entry
            .addCase(createAbsenceEntry.pending, (state) => {
                state.creating = true;
                state.error = null;
            })
            .addCase(createAbsenceEntry.fulfilled, (state, action) => {
                state.creating = false;
                // Add/update entries in state
                for (const entry of action.payload.entries) {
                    state.absenceEntries[entry.work_date] = entry;
                }
            })
            .addCase(createAbsenceEntry.rejected, (state, action) => {
                state.creating = false;
                state.error = action.payload || { code: 'UNKNOWN', message: 'Unknown error' };
            });
    },
});

export const { clearError, clearEntries } = entriesSlice.actions;
export default entriesSlice.reducer;

// Selectors
export const selectWorkEntryByDate = (state: { entries: EntriesState }, date: string) =>
    state.entries.workEntries[date];

export const selectAbsenceEntryByDate = (state: { entries: EntriesState }, date: string) =>
    state.entries.absenceEntries[date];

export const selectEntriesLoading = (state: { entries: EntriesState }) =>
    state.entries.loading;

export const selectEntriesCreating = (state: { entries: EntriesState }) =>
    state.entries.creating;

export const selectEntriesError = (state: { entries: EntriesState }) =>
    state.entries.error;

export const selectLoadedMonth = (state: { entries: EntriesState }) =>
    state.entries.loadedMonth;
