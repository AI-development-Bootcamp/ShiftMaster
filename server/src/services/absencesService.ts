import { SupabaseClient } from '@supabase/supabase-js';
import { EntryRepository } from '../db/repositories/EntryRepository.js';
import { MonthLockService } from './monthLockService.js';
import type { Entry, NewEntry } from '../db/types/entities.js';
import type {
  CreateAbsenceEntryRequest,
  AbsenceEntryResponse,
} from '@abra-shift-master/shared';
import { EntryErrorCode } from '@abra-shift-master/shared';

export class InvalidDateRangeError extends Error {
  code = EntryErrorCode.INVALID_DATE_RANGE;

  constructor(message: string) {
    super(message);
    this.name = 'InvalidDateRangeError';
  }
}

export class AbsencesService {
  private entryRepo: EntryRepository;
  private monthLockService: MonthLockService;

  constructor(client: SupabaseClient) {
    this.entryRepo = new EntryRepository(client);
    this.monthLockService = new MonthLockService(client);
  }

  /**
   * Create absence entry(ies)
   * For single day: creates one entry
   * For date range: creates multiple entries (one per day)
   * Implements upsert logic: updates existing entry if one exists for the date
   * @param userId - User ID creating the entry
   * @param absenceData - Absence entry data
   * @returns Created absence entries
   */
  async createAbsenceEntry(
    userId: string,
    absenceData: CreateAbsenceEntryRequest
  ): Promise<AbsenceEntryResponse[]> {
    // Determine if single day or range
    const dates = this.getDatesFromRequest(absenceData);

    // Check all months are not locked
    await this.monthLockService.checkLockedForDates(dates);

    // Create or update entries for each date
    const entries: Entry[] = [];
    for (const date of dates) {
      const entry = await this.createOrUpdateAbsenceForDate(userId, date, absenceData);
      entries.push(entry);
    }

    // Transform to response format
    return entries.map(this.transformToResponse);
  }

  /**
   * Get absences for a user within a date range
   * @param userId - User ID
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @param absenceType - Optional filter by absence type
   * @returns Array of absence entries
   */
  async getAbsencesByDateRange(
    userId: string,
    startDate: string,
    endDate: string,
    absenceType?: string
  ): Promise<AbsenceEntryResponse[]> {
    const entries = await this.entryRepo.findByUserIdAndDateRange(userId, startDate, endDate);
    let absenceEntries = entries.filter((e) => e.entry_kind === 'absence');

    // Filter by absence type if provided
    if (absenceType) {
      absenceEntries = absenceEntries.filter((e) => e.absence_type === absenceType);
    }

    return absenceEntries.map(this.transformToResponse);
  }

  /**
   * Get array of dates from request (single day or range)
   */
  private getDatesFromRequest(absenceData: CreateAbsenceEntryRequest): string[] {
    // Single day
    if (absenceData.work_date) {
      return [absenceData.work_date];
    }

    // Date range
    if (absenceData.start_date && absenceData.end_date) {
      return this.getDateRange(absenceData.start_date, absenceData.end_date);
    }

    throw new InvalidDateRangeError(
      'Must provide either work_date (single day) or start_date and end_date (range)'
    );
  }

  /**
   * Get array of dates between start and end (inclusive)
   */
  private getDateRange(startDate: string, endDate: string): string[] {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      throw new InvalidDateRangeError('End date must be after or equal to start date');
    }

    const dates: string[] = [];
    const current = new Date(start);

    while (current <= end) {
      dates.push(this.formatDate(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * Format date as YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Create or update absence entry for a specific date
   * Implements upsert logic
   */
  private async createOrUpdateAbsenceForDate(
    userId: string,
    date: string,
    absenceData: CreateAbsenceEntryRequest
  ): Promise<Entry> {
    // Check for existing entry on this date
    const existingEntries = await this.entryRepo.findByUserIdAndDate(userId, date);
    const existingAbsence = existingEntries.find((e) => e.entry_kind === 'absence');

    if (existingAbsence) {
      // Update existing absence
      return this.entryRepo.update(existingAbsence.entry_id, {
        absence_type: absenceData.absence_type as 'sick' | 'vacation' | 'vacation_partial' | 'reserve' | 'other',
        description: absenceData.description || null,
        attachment_path: absenceData.attachment_path || null,
        last_modified_by: userId,
        last_modified_at: new Date().toISOString(),
      });
    }

    // Create new absence
    const newEntry: NewEntry = {
      user_id: userId,
      entry_kind: 'absence',
      work_date: date,
      absence_type: absenceData.absence_type as 'sick' | 'vacation' | 'vacation_partial' | 'reserve' | 'other',
      description: absenceData.description || null,
      attachment_path: absenceData.attachment_path || null,
      start_time: null,
      end_time: null,
      last_modified_by: userId,
    };

    return this.entryRepo.create(newEntry);
  }

  /**
   * Transform entry to absence response format
   */
  private transformToResponse(entry: Entry): AbsenceEntryResponse {
    return {
      entry_id: entry.entry_id,
      user_id: entry.user_id,
      entry_kind: 'absence',
      work_date: entry.work_date,
      absence_type: entry.absence_type as 'sick' | 'vacation' | 'vacation_partial' | 'reserve' | 'other',
      description: entry.description,
      attachment_path: entry.attachment_path,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      last_modified_by: entry.last_modified_by,
      last_modified_at: entry.last_modified_at,
    };
  }
}
