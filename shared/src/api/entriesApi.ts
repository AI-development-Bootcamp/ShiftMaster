/**
 * Entries API client for time entries CRUD
 */

import { ApiClient } from './client.js';
import type {
    CreateWorkEntryRequest,
    WorkEntryResponse,
} from '../types/index.js';

export interface EntriesApiClient {
    apiClient: ApiClient;
}

/**
 * Create a work entry
 */
export async function createWorkEntry(
    client: EntriesApiClient,
    entryData: CreateWorkEntryRequest
): Promise<{ entry: WorkEntryResponse }> {
    return client.apiClient.post<{ entry: WorkEntryResponse }>(
        '/time-entries',
        entryData
    );
}

/**
 * Get entries by date range
 */
export async function getEntriesByDateRange(
    client: EntriesApiClient,
    startDate: string,
    endDate: string
): Promise<{ entries: WorkEntryResponse[] }> {
    return client.apiClient.get<{ entries: WorkEntryResponse[] }>(
        `/time-entries?start_date=${startDate}&end_date=${endDate}`
    );
}

/**
 * Get entries for a specific month
 */
export async function getEntriesByMonth(
    client: EntriesApiClient,
    year: number,
    month: number
): Promise<{ entries: WorkEntryResponse[] }> {
    return client.apiClient.get<{ entries: WorkEntryResponse[] }>(
        `/time-entries?year=${year}&month=${month}`
    );
}

/**
 * Parse API error to EntryErrorCode
 */
export function parseEntryError(
    error: unknown
): { code: string; message: string; details?: unknown } {
    // Axios error with response
    if (isAxiosError(error) && error.response?.data?.error) {
        const apiError = error.response.data.error;
        return {
            code: apiError.code || 'INTERNAL_SERVER_ERROR',
            message: apiError.message || 'An unexpected error occurred',
            details: apiError.details,
        };
    }

    // Network error
    if (isAxiosError(error) && !error.response) {
        return {
            code: 'NETWORK_ERROR',
            message: 'Network error - please check your connection',
        };
    }

    // Unknown error
    return {
        code: 'INTERNAL_SERVER_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
}

// Type guard for axios errors
function isAxiosError(error: unknown): error is { response?: { data?: { error?: { code?: string; message?: string; details?: unknown } } } } {
    return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}
