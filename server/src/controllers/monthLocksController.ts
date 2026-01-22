/**
 * Month locks controller for handling month lock management requests
 */

import { Request, Response } from 'express';
import {
  listLocksSchema,
  batchUpdateLocksSchema,
} from '../validations/monthLockValidation.js';
import { MonthLocksService } from '../services/monthLocksService.js';
import { supabaseAdmin } from '../db/supabase.js';

/**
 * Handle GET /api/v1/month-locks?year=XXXX - List active locks for a year
 * @admin_only
 */
export async function listLocks(req: Request, res: Response): Promise<void> {
  try {
    // Validate query parameters
    const validationResult = listLocksSchema.safeParse(req.query);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.flatten().fieldErrors,
        },
      });
      return;
    }

    const { year } = validationResult.data;

    // Get locks for year
    const monthLocksService = new MonthLocksService(supabaseAdmin);
    const locks = await monthLocksService.getLocksForYear(year);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        locks,
      },
    });
  } catch (error) {
    // Handle unexpected errors
    console.error('List locks error:', error);
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
 * Handle PUT /api/v1/month-locks/batch - Batch lock/unlock months
 * @admin_only
 */
export async function batchUpdateLocks(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Validate request body
    const validationResult = batchUpdateLocksSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.flatten().fieldErrors,
        },
      });
      return;
    }

    const { year, operations } = validationResult.data;
    const { lock, unlock } = operations;

    // Get admin user ID from JWT token (set by isAuthenticated middleware)
    const actorId = req.user?.userId;

    if (!actorId) {
      res.status(401).json({
        success: false,
        error: {
          message: 'User ID not found in token',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    // Perform batch update
    const monthLocksService = new MonthLocksService(supabaseAdmin);
    const result = await monthLocksService.batchUpdate(
      actorId,
      year,
      lock,
      unlock
    );

    // Return success response
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Handle unexpected errors
    console.error('Batch update locks error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}
