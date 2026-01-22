/**
 * Entries API service for clock-in/clock-out operations
 */
import { apiClient } from './index';

// Types matching the API response structure
export interface ClockInRequest {
    work_date: string;
    start_time: string;
}

export interface ClockInResponse {
    entry_id: number;
    user_id: string;
    entry_kind: 'work';
    work_date: string;
    start_time: string;
    end_time: null;
}

export interface ClockOutRequest {
    end_time: string;
    task_id: number;
    location: string;
}

export interface EntryAssignment {
    entry_assignment_id: number;
    task_id: number;
    location: string;
    start_time: string;
    end_time: string;
}

export interface ClockOutResponse {
    entry_id: number;
    work_date: string;
    start_time: string;
    end_time: string;
    assignments: EntryAssignment[];
}

export interface TimelineEntry {
    entry_id: number;
    entry_kind: 'work' | 'absence';
    start_time: string | null;
    end_time: string | null;
    absence_type?: string;
    assignments?: Array<{
        entry_assignment_id: number;
        task_id: number;
        task_name: string;
        project_name: string;
        location: string;
        duration_minutes: number;
    }>;
}

export interface TimelineDay {
    work_date: string;
    total_work_minutes: number;
    entries: TimelineEntry[];
    absences: TimelineEntry[];
}

export interface TimelineResponse {
    timeline: TimelineDay[];
}

export interface AssignedTask {
    task_id: number;
    task_name: string;
    project_id: number;
    project_name: string;
}

/**
 * Clock in - creates a new work entry with start time
 */
export const clockIn = async (data: ClockInRequest): Promise<ClockInResponse> => {
    return apiClient.post<ClockInResponse>('/entries/clock-in', data);
};

/**
 * Clock out - updates entry with end time and creates task assignment
 */
export const clockOut = async (
    entryId: number,
    data: ClockOutRequest
): Promise<ClockOutResponse> => {
    return apiClient.patch<ClockOutResponse>(`/entries/${entryId}/clock-out`, data);
};

/**
 * Get timeline - returns all entries grouped by date
 */
export const getTimeline = async (params?: {
    startDate?: string;
    endDate?: string;
    userId?: string;
}): Promise<TimelineResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('start_date', params.startDate);
    if (params?.endDate) queryParams.append('end_date', params.endDate);
    if (params?.userId) queryParams.append('user_id', params.userId);

    const queryString = queryParams.toString();
    const url = `/entries/timeline${queryString ? `?${queryString}` : ''}`;

    return apiClient.get<TimelineResponse>(url);
};

/**
 * Get entry by ID - for verifying timer state on app load
 */
export const getEntry = async (entryId: number): Promise<{
    entry_id: number;
    work_date: string;
    start_time: string;
    end_time: string | null;
}> => {
    return apiClient.get(`/entries/${entryId}`);
};

/**
 * Get assigned tasks - returns tasks assigned to current user
 */
export const getAssignedTasks = async (): Promise<AssignedTask[]> => {
    return apiClient.get<AssignedTask[]>('/tasks/assigned');
};
