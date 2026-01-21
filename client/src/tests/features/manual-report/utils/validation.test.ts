import { describe, it, expect } from 'vitest';
import { validateProjectTime } from '../../../../features/manual-report/utils/validation';
import { TimeValue } from '../../../../features/manual-report/types/manualReport';

describe('validation utilities', () => {
  describe('validateProjectTime', () => {
    describe('Valid Time Ranges', () => {
      it('should return null for valid time range (9 AM to 5 PM)', () => {
        const startTime: TimeValue = { hours: 9, minutes: 0, period: 'AM' };
        const endTime: TimeValue = { hours: 5, minutes: 0, period: 'PM' };
        expect(validateProjectTime(startTime, endTime)).toBeNull();
      });

      it('should return null when end time is 1 minute after start', () => {
        const startTime: TimeValue = { hours: 9, minutes: 0, period: 'AM' };
        const endTime: TimeValue = { hours: 9, minutes: 1, period: 'AM' };
        expect(validateProjectTime(startTime, endTime)).toBeNull();
      });

      it('should return null for start 11:59 AM and end 12:00 PM', () => {
        const startTime: TimeValue = { hours: 11, minutes: 59, period: 'AM' };
        const endTime: TimeValue = { hours: 12, minutes: 0, period: 'PM' };
        expect(validateProjectTime(startTime, endTime)).toBeNull();
      });

      it('should return null for late evening shift (same PM period)', () => {
        const startTime: TimeValue = { hours: 11, minutes: 0, period: 'PM' };
        const endTime: TimeValue = { hours: 11, minutes: 59, period: 'PM' };
        expect(validateProjectTime(startTime, endTime)).toBeNull();
      });

      it('should return null for early morning shift', () => {
        const startTime: TimeValue = { hours: 12, minutes: 0, period: 'AM' };
        const endTime: TimeValue = { hours: 8, minutes: 0, period: 'AM' };
        expect(validateProjectTime(startTime, endTime)).toBeNull();
      });
    });

    describe('Invalid Time Ranges - End Before Start', () => {
      it('should return error when end time equals start time', () => {
        const startTime: TimeValue = { hours: 9, minutes: 0, period: 'AM' };
        const endTime: TimeValue = { hours: 9, minutes: 0, period: 'AM' };
        const error = validateProjectTime(startTime, endTime);
        expect(error).not.toBeNull();
        expect(error?.code).toBe('END_TIME_NOT_AFTER_START');
        expect(error?.message).toBe('שעת הסיום חייבת להיות אחרי שעת ההתחלה');
      });

      it('should return error when end time is before start time in same period', () => {
        const startTime: TimeValue = { hours: 10, minutes: 0, period: 'AM' };
        const endTime: TimeValue = { hours: 9, minutes: 0, period: 'AM' };
        const error = validateProjectTime(startTime, endTime);
        expect(error).not.toBeNull();
        expect(error?.code).toBe('END_TIME_NOT_AFTER_START');
      });

      it('should return error when PM start is after PM end', () => {
        const startTime: TimeValue = { hours: 6, minutes: 0, period: 'PM' };
        const endTime: TimeValue = { hours: 5, minutes: 0, period: 'PM' };
        const error = validateProjectTime(startTime, endTime);
        expect(error).not.toBeNull();
        expect(error?.code).toBe('END_TIME_NOT_AFTER_START');
      });

      it('should return error when start at 5 PM and end at 9 AM next day (would be previous day)', () => {
        const startTime: TimeValue = { hours: 5, minutes: 0, period: 'PM' };
        const endTime: TimeValue = { hours: 9, minutes: 0, period: 'AM' };
        const error = validateProjectTime(startTime, endTime);
        expect(error).not.toBeNull();
        expect(error?.code).toBe('END_TIME_NOT_AFTER_START');
      });
    });

    describe('Invalid Input Handling', () => {
      it('should return error for invalid start time hours', () => {
        const startTime: TimeValue = { hours: 0, minutes: 0, period: 'AM' };
        const endTime: TimeValue = { hours: 5, minutes: 0, period: 'PM' };
        const error = validateProjectTime(startTime, endTime);
        expect(error).not.toBeNull();
        expect(error?.code).toBe('INVALID_TIME_VALUE');
      });

      it('should return error for invalid end time hours', () => {
        const startTime: TimeValue = { hours: 9, minutes: 0, period: 'AM' };
        const endTime: TimeValue = { hours: 13, minutes: 0, period: 'PM' };
        const error = validateProjectTime(startTime, endTime);
        expect(error).not.toBeNull();
        expect(error?.code).toBe('INVALID_TIME_VALUE');
      });

      it('should return error for invalid start time minutes', () => {
        const startTime: TimeValue = { hours: 9, minutes: 60, period: 'AM' };
        const endTime: TimeValue = { hours: 5, minutes: 0, period: 'PM' };
        const error = validateProjectTime(startTime, endTime);
        expect(error).not.toBeNull();
        expect(error?.code).toBe('INVALID_TIME_VALUE');
      });

      it('should return error for invalid end time minutes', () => {
        const startTime: TimeValue = { hours: 9, minutes: 0, period: 'AM' };
        const endTime: TimeValue = { hours: 5, minutes: -1, period: 'PM' };
        const error = validateProjectTime(startTime, endTime);
        expect(error).not.toBeNull();
        expect(error?.code).toBe('INVALID_TIME_VALUE');
      });

      it('should return error for non-integer start hours', () => {
        const startTime: TimeValue = { hours: 9.5, minutes: 0, period: 'AM' };
        const endTime: TimeValue = { hours: 5, minutes: 0, period: 'PM' };
        const error = validateProjectTime(startTime, endTime);
        expect(error).not.toBeNull();
        expect(error?.code).toBe('INVALID_TIME_VALUE');
      });

      it('should return error for non-integer end minutes', () => {
        const startTime: TimeValue = { hours: 9, minutes: 0, period: 'AM' };
        const endTime: TimeValue = { hours: 5, minutes: 30.5, period: 'PM' };
        const error = validateProjectTime(startTime, endTime);
        expect(error).not.toBeNull();
        expect(error?.code).toBe('INVALID_TIME_VALUE');
      });
    });

    describe('Edge Cases', () => {
      it('should handle 12 AM (midnight) correctly as start time', () => {
        const startTime: TimeValue = { hours: 12, minutes: 0, period: 'AM' };
        const endTime: TimeValue = { hours: 1, minutes: 0, period: 'AM' };
        expect(validateProjectTime(startTime, endTime)).toBeNull();
      });

      it('should handle 12 PM (noon) correctly as end time', () => {
        const startTime: TimeValue = { hours: 11, minutes: 59, period: 'AM' };
        const endTime: TimeValue = { hours: 12, minutes: 0, period: 'PM' };
        expect(validateProjectTime(startTime, endTime)).toBeNull();
      });

      it('should handle maximum valid time range (1 AM to 12 PM)', () => {
        const startTime: TimeValue = { hours: 1, minutes: 0, period: 'AM' };
        const endTime: TimeValue = { hours: 11, minutes: 59, period: 'PM' };
        expect(validateProjectTime(startTime, endTime)).toBeNull();
      });

      it('should handle minimum valid time difference (1 minute)', () => {
        const startTime: TimeValue = { hours: 12, minutes: 0, period: 'PM' };
        const endTime: TimeValue = { hours: 12, minutes: 1, period: 'PM' };
        expect(validateProjectTime(startTime, endTime)).toBeNull();
      });
    });

    describe('Error Message Consistency', () => {
      it('should always return Hebrew error message for END_TIME_NOT_AFTER_START', () => {
        const startTime: TimeValue = { hours: 10, minutes: 0, period: 'AM' };
        const endTime: TimeValue = { hours: 9, minutes: 0, period: 'AM' };
        const error = validateProjectTime(startTime, endTime);
        expect(error?.message).toBe('שעת הסיום חייבת להיות אחרי שעת ההתחלה');
      });

      it('should return proper error object structure', () => {
        const startTime: TimeValue = { hours: 10, minutes: 0, period: 'AM' };
        const endTime: TimeValue = { hours: 9, minutes: 0, period: 'AM' };
        const error = validateProjectTime(startTime, endTime);
        expect(error).toHaveProperty('code');
        expect(error).toHaveProperty('message');
        expect(typeof error?.code).toBe('string');
        expect(typeof error?.message).toBe('string');
      });
    });
  });
});
