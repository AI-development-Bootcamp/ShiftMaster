/**
 * Redux slice for tasks management (task tree)
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { TaskTreeProject } from '@abra-shift-master/shared';
import { apiClient } from '@/api';

interface TasksState {
    // Task tree (projects with their tasks)
    taskTree: TaskTreeProject[];
    // Loading state
    loading: boolean;
    // Error state
    error: { code: string; message: string } | null;
    // Whether task tree has been fetched
    loaded: boolean;
}

const initialState: TasksState = {
    taskTree: [],
    loading: false,
    error: null,
    loaded: false,
};

/**
 * Fetch user's task tree
 */
export const fetchTaskTree = createAsyncThunk<
    { projects: TaskTreeProject[] },
    { includeInactive?: boolean; projectId?: string } | undefined,
    { rejectValue: { code: string; message: string } }
>('tasks/fetchTaskTree', async (options, { rejectWithValue }) => {
    try {
        let url = '/me/task-tree';
        const params: string[] = [];

        if (options?.includeInactive) {
            params.push('include_inactive=true');
        }
        if (options?.projectId) {
            params.push(`project_id=${options.projectId}`);
        }

        if (params.length > 0) {
            url += '?' + params.join('&');
        }

        const result = await apiClient.get<{ projects: TaskTreeProject[] }>(url);
        return result;
    } catch (err) {
        const error = parseApiError(err);
        return rejectWithValue(error);
    }
});

/**
 * Parse API errors
 */
function parseApiError(err: unknown): { code: string; message: string } {
    if (isAxiosError(err) && err.response?.data?.error) {
        const apiError = err.response.data.error;
        return {
            code: apiError.code || 'INTERNAL_SERVER_ERROR',
            message: apiError.message || 'An unexpected error occurred',
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
    response?: { data?: { error?: { code?: string; message?: string } } };
} {
    return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}

const tasksSlice = createSlice({
    name: 'tasks',
    initialState,
    reducers: {
        clearTaskTree: (state) => {
            state.taskTree = [];
            state.loaded = false;
            state.error = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTaskTree.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTaskTree.fulfilled, (state, action) => {
                state.loading = false;
                state.loaded = true;
                state.taskTree = action.payload.projects;
            })
            .addCase(fetchTaskTree.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || { code: 'UNKNOWN', message: 'Unknown error' };
            });
    },
});

export const { clearTaskTree, clearError } = tasksSlice.actions;
export default tasksSlice.reducer;

// Selectors
export const selectTaskTree = (state: { tasks: TasksState }) =>
    state.tasks.taskTree;

export const selectTasksLoading = (state: { tasks: TasksState }) =>
    state.tasks.loading;

export const selectTasksError = (state: { tasks: TasksState }) =>
    state.tasks.error;

export const selectTasksLoaded = (state: { tasks: TasksState }) =>
    state.tasks.loaded;

// Derived selectors for project/task groups
export const selectProjectGroups = (state: { tasks: TasksState }) =>
    state.tasks.taskTree.map((project) => ({
        id: project.project_id,
        label: project.project_name,
        clientName: project.client_name,
        timeFormatType: project.time_format_type,
    }));

export const selectTasksByProject = (state: { tasks: TasksState }, projectId: string) => {
    const project = state.tasks.taskTree.find((p) => p.project_id === projectId);
    if (!project) return [];
    return project.tasks.map((task) => ({
        id: task.task_id,
        label: task.task_name,
        description: task.task_description,
    }));
};
