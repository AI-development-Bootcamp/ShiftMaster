import { EntryErrorCode } from '@abra-shift-master/shared';
import type { EntryAssignmentInput } from '@abra-shift-master/shared';
import type { ProjectTimeFormatType } from '../db/types/entities.js';

export class TimeFormatMismatchError extends Error {
  code = EntryErrorCode.TIME_FORMAT_MISMATCH;
  details: {
    project_id: string;
    project_name: string;
    required_format: 'start_end' | 'sum';
    provided_format: 'start_end' | 'sum';
  };

  constructor(
    projectId: string,
    projectName: string,
    requiredFormat: 'start_end' | 'sum',
    providedFormat: 'start_end' | 'sum'
  ) {
    super(
      `Time format mismatch for project ${projectName}: requires ${requiredFormat} but got ${providedFormat}`
    );
    this.name = 'TimeFormatMismatchError';
    this.details = {
      project_id: projectId,
      project_name: projectName,
      required_format: requiredFormat,
      provided_format: providedFormat,
    };
  }
}

export class InvalidTimeRangeError extends Error {
  code = EntryErrorCode.INVALID_TIME_RANGE;

  constructor(message: string) {
    super(message);
    this.name = 'InvalidTimeRangeError';
  }
}

export class MissingTimeDataError extends Error {
  code = EntryErrorCode.MISSING_TIME_DATA;

  constructor(message: string) {
    super(message);
    this.name = 'MissingTimeDataError';
  }
}

export class TimeFormatValidationService {
  /**
   * Validate that assignment time data matches the project's required time format
   * @param assignment - Assignment input with time data
   * @param projectTimeFormat - Project's required time format ('start_end' or 'sum')
   * @param projectId - Project ID for error details
   * @param projectName - Project name for error details
   * @throws {TimeFormatMismatchError} If time format doesn't match
   * @throws {InvalidTimeRangeError} If time range is invalid
   * @throws {MissingTimeDataError} If required time data is missing
   */
  validateAssignmentTimeFormat(
    assignment: EntryAssignmentInput,
    projectTimeFormat: ProjectTimeFormatType,
    projectId: string,
    projectName: string
  ): void {
    if (projectTimeFormat === 'start_end') {
      this.validateStartEndFormat(assignment, projectId, projectName);
    } else if (projectTimeFormat === 'sum') {
      this.validateSumFormat(assignment, projectId, projectName);
    }
  }

  /**
   * Validate start_end format: requires start_time and end_time, no duration_minutes
   */
  private validateStartEndFormat(
    assignment: EntryAssignmentInput,
    projectId: string,
    projectName: string
  ): void {
    const hasStartEnd = assignment.start_time && assignment.end_time;
    const hasDuration = assignment.duration_minutes !== null && assignment.duration_minutes !== undefined;

    if (!hasStartEnd) {
      throw new MissingTimeDataError(
        `Project ${projectName} requires start and end times, but they were not provided`
      );
    }

    if (hasDuration) {
      throw new TimeFormatMismatchError(projectId, projectName, 'start_end', 'sum');
    }

    // Validate time range (end must be after start)
    this.validateTimeRange(assignment.start_time!, assignment.end_time!);
  }

  /**
   * Validate sum format: requires duration_minutes, no start_time/end_time
   */
  private validateSumFormat(
    assignment: EntryAssignmentInput,
    projectId: string,
    projectName: string
  ): void {
    const hasStartEnd = assignment.start_time || assignment.end_time;
    const hasDuration = assignment.duration_minutes !== null && assignment.duration_minutes !== undefined;

    if (!hasDuration) {
      throw new MissingTimeDataError(
        `Project ${projectName} requires duration in minutes, but it was not provided`
      );
    }

    if (hasStartEnd) {
      throw new TimeFormatMismatchError(projectId, projectName, 'sum', 'start_end');
    }

    // Validate duration is positive
    if (assignment.duration_minutes! <= 0) {
      throw new InvalidTimeRangeError('Duration must be greater than 0 minutes');
    }
  }

  /**
   * Validate that end time is after start time
   */
  private validateTimeRange(startTime: string, endTime: string): void {
    // Parse times as HH:MM:SS
    const start = this.parseTime(startTime);
    const end = this.parseTime(endTime);

    if (end <= start) {
      throw new InvalidTimeRangeError('End time must be after start time');
    }
  }

  /**
   * Parse time string (HH:MM:SS) to minutes since midnight for comparison
   */
  private parseTime(timeString: string): number {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 60 + minutes + (seconds || 0) / 60;
  }
}
