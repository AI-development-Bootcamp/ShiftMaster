/**
 * Absences controller for handling absence entry CRUD
 */

import { Request, Response } from 'express';
import { AbsencesService, InvalidDateRangeError } from '../services/absencesService.js';
import { MonthLockedError } from '../services/monthLockService.js';
import { supabaseAdmin } from '../db/supabase.js';
import type { CreateAbsenceEntryRequest } from '@abra-shift-master/shared';

const VALID_ABSENCE_TYPES = ['sick', 'vacation', 'vacation_partial', 'reserve', 'other'];

/**
 * Handle POST /api/v1/absences - Create absence entry
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
        const absenceData: CreateAbsenceEntryRequest = req.body;

        // Validate required fields
        if (!absenceData.work_date && (!absenceData.start_date || !absenceData.end_date)) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Either work_date (single day) or start_date and end_date (range) is required',
                    code: 'VALIDATION_ERROR',
                },
            });
            return;
        }

        if (!absenceData.absence_type) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'absence_type is required',
                    code: 'VALIDATION_ERROR',
                },
            });
            return;
        }

        if (!VALID_ABSENCE_TYPES.includes(absenceData.absence_type)) {
            res.status(400).json({
                success: false,
                error: {
                    message: `Invalid absence_type. Must be one of: ${VALID_ABSENCE_TYPES.join(', ')}`,
                    code: 'INVALID_ABSENCE_TYPE',
                },
            });
            return;
        }

        // Create absence
        const absencesService = new AbsencesService(supabaseAdmin);
        const entries = await absencesService.createAbsenceEntry(userId, absenceData);

        res.status(201).json({
            success: true,
            data: {
                entries,
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

        // Handle invalid date range error
        if (error instanceof InvalidDateRangeError) {
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
        console.error('Create absence error:', error);
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
 * Handle GET /api/v1/absences - List absences
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
        const startDate = req.query.start_date as string | undefined;
        const endDate = req.query.end_date as string | undefined;
        const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
        const month = req.query.month ? parseInt(req.query.month as string, 10) : undefined;
        const absenceType = req.query.absence_type as string | undefined;

        // Determine date range
        let actualStartDate: string;
        let actualEndDate: string;

        if (startDate && endDate) {
            actualStartDate = startDate;
            actualEndDate = endDate;
        } else if (year && month) {
            actualStartDate = `${year}-${String(month).padStart(2, '0')}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            actualEndDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        } else {
            // Default to current month
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;
            actualStartDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
            const lastDay = new Date(currentYear, currentMonth, 0).getDate();
            actualEndDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        }

        const absencesService = new AbsencesService(supabaseAdmin);
        const absences = await absencesService.getAbsencesByDateRange(
            userId,
            actualStartDate,
            actualEndDate,
            absenceType
        );

        res.status(200).json({
            success: true,
            data: {
                absences,
            },
        });
    } catch (error) {
        console.error('List absences error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}
