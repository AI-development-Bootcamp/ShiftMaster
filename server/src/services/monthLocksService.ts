/**
 * Month locks management service
 * Business logic for month lock operations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { MonthLockRepository } from '../db/repositories/MonthLockRepository.js';
import { MonthLock, NewMonthLock } from '../db/types/entities.js';

/**
 * Error thrown when a month is already locked
 */
export class MonthAlreadyLockedError extends Error {
  code = 'MONTH_ALREADY_LOCKED';
  constructor(year: number, month: number) {
    super(`Month ${month} of year ${year} is already locked`);
    this.name = 'MonthAlreadyLockedError';
  }
}

/**
 * Error thrown when trying to unlock a month that is not locked
 */
export class MonthNotLockedError extends Error {
  code = 'MONTH_NOT_LOCKED';
  constructor(year: number, month: number) {
    super(`Month ${month} of year ${year} is not locked`);
    this.name = 'MonthNotLockedError';
  }
}

/**
 * Result of batch update operation
 */
export interface BatchUpdateResult {
  locked: number[];
  unlocked: number[];
}

/**
 * MonthLocksService class
 * Handles all month lock business logic
 */
export class MonthLocksService {
  private monthLockRepo: MonthLockRepository;

  constructor(dbConnection: SupabaseClient) {
    if (!dbConnection) {
      throw new Error('dbConnection is required for MonthLocksService');
    }
    this.monthLockRepo = new MonthLockRepository(dbConnection);
  }

  /**
   * Get all active locks for a specific year
   * @param year - The year to query
   * @returns Array of month locks for the year
   */
  async getLocksForYear(year: number): Promise<MonthLock[]> {
    return this.monthLockRepo.findByYear(year);
  }

  /**
   * Batch lock and unlock months for a specific year
   * @param actorId - User ID performing the operation
   * @param year - The year to operate on
   * @param toLock - Array of month numbers (1-12) to lock
   * @param toUnlock - Array of month numbers (1-12) to unlock
   * @returns Object containing arrays of successfully locked and unlocked months
   */
  async batchUpdate(
    actorId: string,
    year: number,
    toLock: number[],
    toUnlock: number[]
  ): Promise<BatchUpdateResult> {
    const locked: number[] = [];
    const unlocked: number[] = [];

    // Process locks
    for (const month of toLock) {
      // Check if month is already locked
      const existingLock = await this.monthLockRepo.findByYearAndMonth(
        year,
        month
      );

      if (!existingLock) {
        // Lock the month by creating a new lock record
        const newLock: NewMonthLock = {
          year,
          month,
          locked_by: actorId,
        };
        await this.monthLockRepo.create(newLock);
        locked.push(month);
      }
      // If already locked, silently skip (idempotent operation)
    }

    // Process unlocks
    for (const month of toUnlock) {
      // Find the existing lock
      const existingLock = await this.monthLockRepo.findByYearAndMonth(
        year,
        month
      );

      if (existingLock) {
        // Unlock by deleting the lock row
        await this.monthLockRepo.delete(existingLock.lock_id);
        unlocked.push(month);
      }
      // If not locked, silently skip (idempotent operation)
    }

    return { locked, unlocked };
  }
}
