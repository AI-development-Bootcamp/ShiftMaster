import { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import {
  EntriesService,
  EntryNotFoundError,
  MonthLockedError,
  ActiveTimerExistsError,
  TimeOverlapError,
  DailyLimitExceededError,
  TaskNotAssignedError,
  InvalidEntryStateError,
} from '../services/entriesService.js';
import { clockInSchema, clockOutSchema } from '../validations/entryValidation.js';

export async function clockIn(req: Request, res: Response): Promise<void> {
  try {
    const validation = clockInSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validation.error.errors,
        },
      });
      return;
    }

    const userId = req.user!.userId;
    const { work_date, start_time } = validation.data;

    const entriesService = new EntriesService(supabaseAdmin);
    const entry = await entriesService.clockIn(userId, work_date, start_time);

    res.status(201).json({
      success: true,
      data: {
        entry_id: entry.entry_id,
        user_id: entry.user_id,
        entry_kind: entry.entry_kind,
        work_date: entry.work_date,
        start_time: entry.start_time,
        end_time: entry.end_time,
      },
    });
  } catch (error) {
    console.error('Clock in error:', error);

    if (error instanceof MonthLockedError) {
      res.status(403).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
      return;
    }

    if (error instanceof ActiveTimerExistsError) {
      res.status(409).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}

export async function clockOut(req: Request, res: Response): Promise<void> {
  try {
    const entryId = req.params.id;
    const validation = clockOutSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validation.error.errors,
        },
      });
      return;
    }

    const userId = req.user!.userId;
    const { end_time, task_id, location } = validation.data;

    const entriesService = new EntriesService(supabaseAdmin);
    const entry = await entriesService.clockOut(userId, entryId, end_time, task_id, location);

    res.status(200).json({
      success: true,
      data: {
        entry_id: entry.entry_id,
        work_date: entry.work_date,
        start_time: entry.start_time,
        end_time: entry.end_time,
      },
    });
  } catch (error) {
    console.error('Clock out error:', error);

    if (error instanceof EntryNotFoundError) {
      res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
      return;
    }

    if (error instanceof MonthLockedError) {
      res.status(403).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
      return;
    }

    if (error instanceof TaskNotAssignedError) {
      res.status(403).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
      return;
    }

    if (error instanceof TimeOverlapError || error instanceof InvalidEntryStateError) {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
      return;
    }

    if (error instanceof DailyLimitExceededError) {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}
