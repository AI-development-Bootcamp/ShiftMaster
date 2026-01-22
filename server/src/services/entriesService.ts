import { SupabaseClient } from '@supabase/supabase-js';
import { EntryRepository } from '../db/repositories/EntryRepository.js';
import { EntryAssignmentRepository } from '../db/repositories/EntryAssignmentRepository.js';
import { MonthLockRepository } from '../db/repositories/MonthLockRepository.js';
import { AdminTaskAssignmentRepository } from '../db/repositories/AdminTaskAssignmentRepository.js';
import { Entry, NewEntry, NewEntryAssignment, WorkLocation, AbsenceType } from '../db/types/entities.js';

// Timeline types
interface RawAssignmentData {
  entry_assignment_id: string;
  entry_id: string;
  task_id: string;
  location: WorkLocation;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  tasks: {
    task_name: string;
    projects: {
      project_name: string;
    }[];
  }[];
}

interface AssignmentWithDetails {
  entry_assignment_id: string;
  entry_id: string;
  task_id: string;
  location: WorkLocation;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  task_name: string | null;
  project_name: string | null;
}

interface TimelineAssignment {
  entry_assignment_id: string;
  task_id: string;
  task_name: string | null;
  project_name: string | null;
  location: WorkLocation;
  duration_minutes: number | null;
}

interface TimelineEntry {
  entry_id: string;
  entry_kind: 'work';
  start_time: string | null;
  end_time: string | null;
  is_active: boolean;
  is_locked: boolean;
  assignments: TimelineAssignment[];
}

interface TimelineAbsence {
  entry_id: string;
  entry_kind: 'absence';
  absence_type: AbsenceType | null;
  description: string | null;
  is_locked: boolean;
}

interface TimelineDay {
  work_date: string;
  total_work_minutes: number;
  entries: TimelineEntry[];
  absences: TimelineAbsence[];
}

export class EntryNotFoundError extends Error {
  code = 'ENTRY_NOT_FOUND';
  constructor(entryId: string) {
    super(`Entry with ID ${entryId} not found`);
    this.name = 'EntryNotFoundError';
  }
}

export class MonthLockedError extends Error {
  code = 'MONTH_LOCKED';
  constructor(date: string) {
    super(`Cannot modify entries for ${date} - month is locked`);
    this.name = 'MonthLockedError';
  }
}

export class ActiveTimerExistsError extends Error {
  code = 'ACTIVE_TIMER_EXISTS';
  constructor() {
    super('An active timer already exists for today');
    this.name = 'ActiveTimerExistsError';
  }
}

export class TimeOverlapError extends Error {
  code = 'TIME_OVERLAP';
  constructor(message: string) {
    super(message);
    this.name = 'TimeOverlapError';
  }
}

export class DailyLimitExceededError extends Error {
  code = 'DAILY_LIMIT_EXCEEDED';
  constructor() {
    super('Total work time for this day exceeds 24 hours');
    this.name = 'DailyLimitExceededError';
  }
}

export class TaskNotAssignedError extends Error {
  code = 'TASK_NOT_ASSIGNED';
  constructor(taskId: string) {
    super(`User is not assigned to task ${taskId}`);
    this.name = 'TaskNotAssignedError';
  }
}

export class InvalidEntryStateError extends Error {
  code = 'INVALID_ENTRY_STATE';
  constructor(message: string) {
    super(message);
    this.name = 'InvalidEntryStateError';
  }
}

export class EntriesService {
  private entryRepo: EntryRepository;
  private entryAssignmentRepo: EntryAssignmentRepository;
  private monthLockRepo: MonthLockRepository;
  private adminTaskAssignmentRepo: AdminTaskAssignmentRepository;

  constructor(client: SupabaseClient) {
    this.entryRepo = new EntryRepository(client);
    this.entryAssignmentRepo = new EntryAssignmentRepository(client);
    this.monthLockRepo = new MonthLockRepository(client);
    this.adminTaskAssignmentRepo = new AdminTaskAssignmentRepository(client);
  }

  /**
   * Clock in - Create entry with start_time only
   */
  async clockIn(userId: string, workDate: string, startTime: string): Promise<Entry> {
    // Check month lock
    await this.validateMonthNotLocked(workDate);

    // Check for existing active timer
    const activeTimer = await this.findActiveTimer(userId, workDate);
    if (activeTimer) {
      throw new ActiveTimerExistsError();
    }

    // Create entry with start_time only
    const newEntry: NewEntry = {
      user_id: userId,
      entry_kind: 'work',
      work_date: workDate,
      start_time: startTime,
      end_time: null,
      description: null,
      absence_type: null,
      attachment_path: null,
      last_modified_by: userId,
    };

    return this.entryRepo.create(newEntry);
  }

  /**
   * Clock out - Update entry with end_time and create task assignment
   */
  async clockOut(
    userId: string,
    entryId: string,
    endTime: string,
    taskId: string,
    location: WorkLocation
  ): Promise<Entry> {
    // Find entry
    const entry = await this.entryRepo.findById(entryId);
    if (!entry) {
      throw new EntryNotFoundError(entryId);
    }

    // Verify entry belongs to user
    if (entry.user_id !== userId) {
      throw new EntryNotFoundError(entryId);
    }

    // Verify entry is active (has start_time but no end_time)
    if (!entry.start_time || entry.end_time) {
      throw new InvalidEntryStateError('Entry is not in active timer state');
    }

    // Check month lock
    await this.validateMonthNotLocked(entry.work_date);

    // Validate task assignment
    await this.validateTaskAssignment(userId, taskId);

    // Validate time overlap and daily limit
    await this.validateTimeOverlap(userId, entry.work_date, entry.start_time, endTime, entryId);
    await this.validateDailyLimit(userId, entry.work_date, entry.start_time, endTime, entryId);

    // Update entry with end_time
    const updatedEntry = await this.entryRepo.update(entryId, {
      end_time: endTime,
      last_modified_by: userId,
      last_modified_at: new Date().toISOString(),
    });

    // Create entry assignment
    const assignment: NewEntryAssignment = {
      entry_id: entryId,
      task_id: taskId,
      location,
      start_time: entry.start_time,
      end_time: endTime,
      duration_minutes: null, // Will be calculated by database or can be set here
    };

    await this.entryAssignmentRepo.create(assignment);

    return updatedEntry;
  }

  /**
   * Find active timer for user on specific date
   */
  private async findActiveTimer(userId: string, workDate: string): Promise<Entry | null> {
    const entries = await this.entryRepo.findByUserIdAndDate(userId, workDate);
    return entries.find((e) => e.entry_kind === 'work' && e.start_time && !e.end_time) || null;
  }

  /**
   * Validate month is not locked
   */
  private async validateMonthNotLocked(workDate: string): Promise<void> {
    const date = new Date(workDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // JS months are 0-indexed

    const isLocked = await this.monthLockRepo.isMonthLocked(year, month);
    if (isLocked) {
      throw new MonthLockedError(workDate);
    }
  }

  /**
   * Validate user has active task assignment
   */
  private async validateTaskAssignment(userId: string, taskId: string): Promise<void> {
    const assignments = await this.adminTaskAssignmentRepo.findByUserId(userId);
    const hasAssignment = assignments.some((a) => a.task_id === taskId && a.active);

    if (!hasAssignment) {
      throw new TaskNotAssignedError(taskId);
    }
  }

  /**
   * Validate no time overlap with existing entries
   */
  private async validateTimeOverlap(
    userId: string,
    workDate: string,
    startTime: string,
    endTime: string,
    excludeEntryId?: string
  ): Promise<void> {
    const entries = await this.entryRepo.findByUserIdAndDate(userId, workDate);

    // Filter out the current entry if updating
    const otherEntries = excludeEntryId
      ? entries.filter((e) => e.entry_id !== excludeEntryId)
      : entries;

    // Check for overlaps
    for (const entry of otherEntries) {
      if (entry.entry_kind === 'work' && entry.start_time && entry.end_time) {
        const hasOverlap = this.checkTimeRangeOverlap(
          startTime,
          endTime,
          entry.start_time,
          entry.end_time
        );

        if (hasOverlap) {
          throw new TimeOverlapError(
            `Time range ${startTime}-${endTime} overlaps with existing entry ${entry.start_time}-${entry.end_time}`
          );
        }
      }
    }
  }

  /**
   * Validate total work time doesn't exceed 24 hours
   */
  private async validateDailyLimit(
    userId: string,
    workDate: string,
    startTime: string,
    endTime: string,
    excludeEntryId?: string
  ): Promise<void> {
    const entries = await this.entryRepo.findByUserIdAndDate(userId, workDate);

    // Filter out the current entry if updating
    const otherEntries = excludeEntryId
      ? entries.filter((e) => e.entry_id !== excludeEntryId)
      : entries;

    // Calculate total minutes from other entries
    let totalMinutes = 0;
    for (const entry of otherEntries) {
      if (entry.entry_kind === 'work' && entry.start_time && entry.end_time) {
        totalMinutes += this.calculateDurationMinutes(entry.start_time, entry.end_time);
      }
    }

    // Add current entry duration
    totalMinutes += this.calculateDurationMinutes(startTime, endTime);

    // Check 24-hour limit (1440 minutes)
    if (totalMinutes > 1440) {
      throw new DailyLimitExceededError();
    }
  }

  /**
   * Check if two time ranges overlap
   */
  private checkTimeRangeOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
  ): boolean {
    const s1 = this.timeToMinutes(start1);
    const e1 = this.timeToMinutes(end1);
    const s2 = this.timeToMinutes(start2);
    const e2 = this.timeToMinutes(end2);

    return s1 < e2 && e1 > s2;
  }

  /**
   * Calculate duration in minutes between start and end times
   */
  private calculateDurationMinutes(startTime: string, endTime: string): number {
    return this.timeToMinutes(endTime) - this.timeToMinutes(startTime);
  }

  /**
   * Convert HH:MM:SS time string to minutes since midnight
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Get timeline - unified view of work entries and absences grouped by date
   *
   * Performance: Uses database index idx_entries_user_date_range on (user_id, work_date)
   * for efficient querying across date ranges
   */
  async getTimeline(userId: string, startDate: string, endDate: string): Promise<TimelineDay[]> {
    // Fetch all entries in date range (optimized by idx_entries_user_date_range index)
    const entries = await this.entryRepo.findByUserIdAndDateRange(userId, startDate, endDate);

    // Get all entry_assignment IDs for fetching related data
    const entryIds = entries.map((e) => e.entry_id);

    // Fetch assignments with task and project details
    const assignmentsWithDetails = await this.fetchAssignmentsWithDetails(entryIds);

    // Check which months are locked
    const lockedMonths = await this.getLockedMonths(startDate, endDate);

    // Group entries by date
    const timelineMap = new Map<string, TimelineDay>();

    for (const entry of entries) {
      const workDate = entry.work_date;

      if (!timelineMap.has(workDate)) {
        timelineMap.set(workDate, {
          work_date: workDate,
          total_work_minutes: 0,
          entries: [],
          absences: [],
        });
      }

      const dayData = timelineMap.get(workDate)!;
      const isLocked = this.isDateLocked(workDate, lockedMonths);

      if (entry.entry_kind === 'work') {
        // Get assignments for this entry
        const entryAssignments = assignmentsWithDetails.filter((a) => a.entry_id === entry.entry_id);

        // Calculate total work minutes for the day
        if (entry.start_time && entry.end_time) {
          const duration = this.calculateDurationMinutes(entry.start_time, entry.end_time);
          dayData.total_work_minutes += duration;
        }

        dayData.entries.push({
          entry_id: entry.entry_id,
          entry_kind: entry.entry_kind,
          start_time: entry.start_time,
          end_time: entry.end_time,
          is_active: !!entry.start_time && !entry.end_time,
          is_locked: isLocked,
          assignments: entryAssignments.map((a) => ({
            entry_assignment_id: a.entry_assignment_id,
            task_id: a.task_id,
            task_name: a.task_name,
            project_name: a.project_name,
            location: a.location,
            duration_minutes: a.duration_minutes,
          })),
        });
      } else if (entry.entry_kind === 'absence') {
        dayData.absences.push({
          entry_id: entry.entry_id,
          entry_kind: entry.entry_kind,
          absence_type: entry.absence_type,
          description: entry.description,
          is_locked: isLocked,
        });
      }
    }

    // Convert map to sorted array
    return Array.from(timelineMap.values()).sort((a, b) => b.work_date.localeCompare(a.work_date));
  }

  /**
   * Fetch assignments with task and project details
   */
  private async fetchAssignmentsWithDetails(entryIds: string[]): Promise<AssignmentWithDetails[]> {
    if (entryIds.length === 0) {
      return [];
    }

    // Use Supabase query to join entry_assignments with tasks and projects
    const { data, error } = await this.entryRepo['dbConnection']
      .from('entry_assignments')
      .select(
        `
        entry_assignment_id,
        entry_id,
        task_id,
        location,
        start_time,
        end_time,
        duration_minutes,
        tasks!inner(
          task_name,
          projects!inner(
            project_name
          )
        )
      `
      )
      .in('entry_id', entryIds);

    if (error) {
      console.error('Error fetching assignments with details:', error);
      throw error;
    }

    // Flatten the nested structure
    return (
      data?.map((a: RawAssignmentData) => ({
        entry_assignment_id: a.entry_assignment_id,
        entry_id: a.entry_id,
        task_id: a.task_id,
        location: a.location,
        start_time: a.start_time,
        end_time: a.end_time,
        duration_minutes: a.duration_minutes,
        task_name: a.tasks?.[0]?.task_name || null,
        project_name: a.tasks?.[0]?.projects?.[0]?.project_name || null,
      })) || []
    );
  }

  /**
   * Get locked months in date range
   */
  private async getLockedMonths(startDate: string, endDate: string): Promise<Set<string>> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const lockedMonths = new Set<string>();

    // Get all unique year-month combinations in range
    const monthsToCheck = new Set<string>();
    const current = new Date(start);

    while (current <= end) {
      const year = current.getFullYear();
      const month = current.getMonth() + 1;
      monthsToCheck.add(`${year}-${month}`);
      current.setMonth(current.getMonth() + 1);
    }

    // Check each month
    for (const yearMonth of monthsToCheck) {
      const [year, month] = yearMonth.split('-').map(Number);
      const isLocked = await this.monthLockRepo.isMonthLocked(year, month);
      if (isLocked) {
        lockedMonths.add(`${year}-${month}`);
      }
    }

    return lockedMonths;
  }

  /**
   * Check if a date is in a locked month
   */
  private isDateLocked(workDate: string, lockedMonths: Set<string>): boolean {
    const date = new Date(workDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return lockedMonths.has(`${year}-${month}`);
  }
}
