import { SupabaseClient } from '@supabase/supabase-js';
import { MonthLockRepository } from '../db/repositories/MonthLockRepository.js';
import { EntryErrorCode } from '@abra-shift-master/shared';

export class MonthLockedError extends Error {
  code = EntryErrorCode.MONTH_LOCKED;
  details: {
    year: number;
    month: number;
    locked_by: string;
    locked_at: string;
  };

  constructor(year: number, month: number, lockedBy: string, lockedAt: string) {
    super(`Cannot modify entries for ${year}-${month.toString().padStart(2, '0')}: month is locked`);
    this.name = 'MonthLockedError';
    this.details = {
      year,
      month,
      locked_by: lockedBy,
      locked_at: lockedAt,
    };
  }
}

export class MonthLockService {
  private monthLockRepo: MonthLockRepository;

  constructor(client: SupabaseClient) {
    this.monthLockRepo = new MonthLockRepository(client);
  }

  /**
   * Check if a month is locked. Throws MonthLockedError if locked.
   * @param workDate - Date string in YYYY-MM-DD format
   * @throws {MonthLockedError} If the month is locked
   */
  async checkLocked(workDate: string): Promise<void> {
    const { year, month } = this.parseYearMonth(workDate);
    const lock = await this.monthLockRepo.findByYearAndMonth(year, month);

    if (lock && !lock.unlocked_at) {
      throw new MonthLockedError(year, month, lock.locked_by, lock.locked_at);
    }
  }

  /**
   * Check if multiple dates fall within locked months
   * @param dates - Array of date strings in YYYY-MM-DD format
   * @throws {MonthLockedError} If any month is locked
   */
  async checkLockedForDates(dates: string[]): Promise<void> {
    // Get unique year-month combinations
    const uniqueMonths = new Set<string>();
    for (const date of dates) {
      const { year, month } = this.parseYearMonth(date);
      uniqueMonths.add(`${year}-${month}`);
    }

    // Check each unique month
    for (const monthKey of uniqueMonths) {
      const [yearStr, monthStr] = monthKey.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);

      const lock = await this.monthLockRepo.findByYearAndMonth(year, month);
      if (lock && !lock.unlocked_at) {
        throw new MonthLockedError(year, month, lock.locked_by, lock.locked_at);
      }
    }
  }

  /**
   * Parse year and month from a date string
   * @param dateString - Date in YYYY-MM-DD format
   * @returns Object with year and month
   */
  private parseYearMonth(dateString: string): { year: number; month: number } {
    const date = new Date(dateString);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1, // JavaScript months are 0-indexed
    };
  }
}
