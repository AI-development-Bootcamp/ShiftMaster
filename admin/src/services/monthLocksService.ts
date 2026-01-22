/**
 * Month Locks Service
 * 
 * Frontend service for month lock API operations.
 * Provides methods to fetch lock status and batch update locks.
 */

import { apiClient } from '../api';
import { MonthLock } from '@abra-shift-master/shared';

// Custom error class for API errors with status codes
export class MonthLocksApiError extends Error {
    code: number;
    originalError?: unknown;

    constructor(message: string, code: number, originalError?: unknown) {
        super(message);
        this.name = 'MonthLocksApiError';
        this.code = code;
        this.originalError = originalError;
    }
}

// Types for API payloads
export interface BatchUpdatePayload {
    year: number;
    operations: {
        lock: number[];
        unlock: number[];
    };
}

export interface BatchUpdateResult {
    locked: number[];
    unlocked: number[];
}

// Helper to extract error details from API client errors
function extractErrorDetails(error: unknown): { status: number; message: string } {
    if (error && typeof error === 'object') {
        const err = error as { response?: { status?: number; data?: { message?: string; error?: { message?: string } } }; message?: string };
        const status = err.response?.status ?? 500;
        const message = err.response?.data?.error?.message ?? err.response?.data?.message ?? err.message ?? 'Unknown error';
        return { status, message };
    }
    return { status: 500, message: String(error) };
}

export const monthLocksService = {
    /**
     * Fetch active month locks for a specific year.
     * 
     * @param year - The year to fetch locks for (e.g., 2026)
     * @returns Array of MonthLock objects for locked months
     */
    fetchLocksForYear: async (year: number): Promise<MonthLock[]> => {
        try {
            const result = await apiClient.get<{ locks: MonthLock[] }>('/month-locks', { params: { year } });
            return result?.locks ?? [];
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new MonthLocksApiError(`Failed to fetch month locks: ${message}`, status, error);
        }
    },

    /**
     * Batch update month locks - lock and/or unlock multiple months at once.
     * 
     * @param payload - Object containing year and operations (lock/unlock month arrays)
     * @returns Result object with arrays of successfully locked and unlocked months
     */
    batchUpdateLocks: async (payload: BatchUpdatePayload): Promise<BatchUpdateResult> => {
        try {
            return await apiClient.put<BatchUpdateResult>('/month-locks/batch', payload);
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new MonthLocksApiError(`Failed to update month locks: ${message}`, status, error);
        }
    },
};
