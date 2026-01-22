/**
 * Time Entries controller for handling work entry CRUD
 */

import { Request, Response } from 'express';
import { EntriesService } from '../services/entriesService.js';
import { MonthLockedError } from '../services/monthLockService.js';
import {
    TaskNotAssignedError,
    TaskNotFoundError,
    TaskInactiveError,
} from '../services/taskAssignmentVerification.js';
import {
    TimeFormatMismatchError,
    InvalidTimeRangeError,
    MissingTimeDataError,
} from '../services/timeFormatValidation.js';
import { supabaseAdmin } from '../db/supabase.js';
import type { CreateWorkEntryRequest, GetEntriesQuery } from '@abra-shift-master/shared';

/**
 * Handle POST /api/v1/time-entries - Create work entry
 * @authenticated
 */
export async function create(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: {
                    message: 'User ID not found in token',
                    code: 'UNAUTHORIZED',
                },
            });
            return;
        }

        // Parse request body
        const entryData: CreateWorkEntryRequest = req.body;

        // Validate required fields
        if (!entryData.work_date) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'work_date is required',
                    code: 'VALIDATION_ERROR',
                },
            });
            return;
        }

        if (!entryData.assignments || entryData.assignments.length === 0) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'At least one assignment is required',
                    code: 'VALIDATION_ERROR',
                },
            });
            return;
        }

        // Create entry
        const entriesService = new EntriesService(supabaseAdmin);
        const entry = await entriesService.createWorkEntry(userId, entryData);

        res.status(201).json({
            success: true,
            data: {
                entry,
            },
        });
    } catch (error) {
        // Handle month locked error
        if (error instanceof MonthLockedError) {
            res.status(400).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                },
            });
            return;
        }

        // Handle task not assigned error
        if (error instanceof TaskNotAssignedError) {
            res.status(400).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                },
            });
            return;
        }

        // Handle task not found error
        if (error instanceof TaskNotFoundError) {
            res.status(400).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }

        // Handle task inactive error
        if (error instanceof TaskInactiveError) {
            res.status(400).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }

        // Handle time format mismatch error
        if (error instanceof TimeFormatMismatchError) {
            res.status(400).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                    details: error.details,
                },
            });
            return;
        }

        // Handle invalid time range error
        if (error instanceof InvalidTimeRangeError) {
            res.status(400).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }

        // Handle missing time data error
        if (error instanceof MissingTimeDataError) {
            res.status(400).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }

        // Handle unexpected errors
        console.error('Create time entry error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}

/**
 * Handle GET /api/v1/time-entries - List work entries
 * @authenticated
 */
export async function list(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: {
                    message: 'User ID not found in token',
                    code: 'UNAUTHORIZED',
                },
            });
            return;
        }

        // Parse query params
        const query: GetEntriesQuery = {
            start_date: req.query.start_date as string | undefined,
            end_date: req.query.end_date as string | undefined,
            year: req.query.year ? parseInt(req.query.year as string, 10) : undefined,
            month: req.query.month ? parseInt(req.query.month as string, 10) : undefined,
        };

        // Determine date range
        let startDate: string;
        let endDate: string;

        if (query.start_date && query.end_date) {
            startDate = query.start_date;
            endDate = query.end_date;
        } else if (query.year && query.month) {
            // Calculate first and last day of month
            startDate = `${query.year}-${String(query.month).padStart(2, '0')}-01`;
            const lastDay = new Date(query.year, query.month, 0).getDate();
            endDate = `${query.year}-${String(query.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        } else {
            // Default to current month
            const now = new Date();
            const year = now.getFullYear();
            const month = now.getMonth() + 1;
            startDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        }

        const entriesService = new EntriesService(supabaseAdmin);
        const entries = await entriesService.getEntriesByDateRange(userId, startDate, endDate);

        res.status(200).json({
            success: true,
            data: {
                entries,
            },
        });
    } catch (error) {
        console.error('List time entries error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}
