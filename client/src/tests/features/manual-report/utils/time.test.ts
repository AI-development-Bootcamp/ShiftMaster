import { describe, it, expect } from 'vitest';
import { timeToMinutes, formatTime } from '../../../../features/manual-report/utils/time';
import { TimeValue } from '../../../../features/manual-report/types/manualReport';

describe('time utilities', () => {
  describe('timeToMinutes', () => {
    describe('Valid Time Conversions', () => {
      it('should convert 12 AM to 0 minutes', () => {
        const time: TimeValue = { hours: 12, minutes: 0, period: 'AM' };
        expect(timeToMinutes(time)).toBe(0);
      });

      it('should convert 12:30 AM to 30 minutes', () => {
        const time: TimeValue = { hours: 12, minutes: 30, period: 'AM' };
        expect(timeToMinutes(time)).toBe(30);
      });

      it('should convert 1 AM to 60 minutes', () => {
        const time: TimeValue = { hours: 1, minutes: 0, period: 'AM' };
        expect(timeToMinutes(time)).toBe(60);
      });

      it('should convert 9:15 AM to 555 minutes', () => {
        const time: TimeValue = { hours: 9, minutes: 15, period: 'AM' };
        expect(timeToMinutes(time)).toBe(555);
      });

      it('should convert 11:59 AM to 719 minutes', () => {
        const time: TimeValue = { hours: 11, minutes: 59, period: 'AM' };
        expect(timeToMinutes(time)).toBe(719);
      });

      it('should convert 12 PM to 720 minutes', () => {
        const time: TimeValue = { hours: 12, minutes: 0, period: 'PM' };
        expect(timeToMinutes(time)).toBe(720);
      });

      it('should convert 1 PM to 780 minutes', () => {
        const time: TimeValue = { hours: 1, minutes: 0, period: 'PM' };
        expect(timeToMinutes(time)).toBe(780);
      });

      it('should convert 5:30 PM to 1050 minutes', () => {
        const time: TimeValue = { hours: 5, minutes: 30, period: 'PM' };
        expect(timeToMinutes(time)).toBe(1050);
      });

      it('should convert 11:59 PM to 1439 minutes', () => {
        const time: TimeValue = { hours: 11, minutes: 59, period: 'PM' };
        expect(timeToMinutes(time)).toBe(1439);
      });
    });

    describe('Invalid Input Validation', () => {
      it('should throw error for hours less than 1', () => {
        const time: TimeValue = { hours: 0, minutes: 30, period: 'AM' };
        expect(() => timeToMinutes(time)).toThrow('Invalid time value');
      });

      it('should throw error for hours greater than 12', () => {
        const time: TimeValue = { hours: 13, minutes: 30, period: 'PM' };
        expect(() => timeToMinutes(time)).toThrow('Invalid time value');
      });

      it('should throw error for negative hours', () => {
        const time: TimeValue = { hours: -1, minutes: 30, period: 'AM' };
        expect(() => timeToMinutes(time)).toThrow('Invalid time value');
      });

      it('should throw error for minutes less than 0', () => {
        const time: TimeValue = { hours: 9, minutes: -1, period: 'AM' };
        expect(() => timeToMinutes(time)).toThrow('Invalid time value');
      });

      it('should throw error for minutes greater than 59', () => {
        const time: TimeValue = { hours: 9, minutes: 60, period: 'PM' };
        expect(() => timeToMinutes(time)).toThrow('Invalid time value');
      });

      it('should throw error for non-integer hours', () => {
        const time: TimeValue = { hours: 9.5, minutes: 30, period: 'AM' };
        expect(() => timeToMinutes(time)).toThrow('Invalid time value');
      });

      it('should throw error for non-integer minutes', () => {
        const time: TimeValue = { hours: 9, minutes: 30.5, period: 'PM' };
        expect(() => timeToMinutes(time)).toThrow('Invalid time value');
      });

      it('should throw error with code INVALID_TIME_VALUE', () => {
        const time: TimeValue = { hours: 0, minutes: 30, period: 'AM' };
        let thrownError;

        try {
          timeToMinutes(time);
        } catch (error) {
          thrownError = error;
        }

        expect(thrownError).toBeDefined();
        expect(thrownError).toHaveProperty('code', 'INVALID_TIME_VALUE');
      });
    });
  });

  describe('formatTime', () => {
    describe('Valid Time Formatting', () => {
      it('should format midnight as 00:00', () => {
        expect(formatTime(0, 0)).toBe('00:00');
      });

      it('should format 9:05 AM as 09:05', () => {
        expect(formatTime(9, 5)).toBe('09:05');
      });

      it('should format 12:30 PM as 12:30', () => {
        expect(formatTime(12, 30)).toBe('12:30');
      });

      it('should format 5:45 PM as 17:45', () => {
        expect(formatTime(17, 45)).toBe('17:45');
      });

      it('should format 11:59 PM as 23:59', () => {
        expect(formatTime(23, 59)).toBe('23:59');
      });

      it('should pad single digit hours with zero', () => {
        expect(formatTime(5, 30)).toBe('05:30');
      });

      it('should pad single digit minutes with zero', () => {
        expect(formatTime(15, 5)).toBe('15:05');
      });

      it('should handle zero minutes', () => {
        expect(formatTime(10, 0)).toBe('10:00');
      });

      it('should handle zero hours', () => {
        expect(formatTime(0, 30)).toBe('00:30');
      });
    });

    describe('Invalid Input Validation', () => {
      it('should throw error for hours less than 0', () => {
        expect(() => formatTime(-1, 30)).toThrow('Invalid time value');
      });

      it('should throw error for hours greater than 23', () => {
        expect(() => formatTime(24, 30)).toThrow('Invalid time value');
      });

      it('should throw error for minutes less than 0', () => {
        expect(() => formatTime(10, -1)).toThrow('Invalid time value');
      });

      it('should throw error for minutes greater than 59', () => {
        expect(() => formatTime(10, 60)).toThrow('Invalid time value');
      });

      it('should throw error for non-integer hours', () => {
        expect(() => formatTime(10.5, 30)).toThrow('Invalid time value');
      });

      it('should throw error for non-integer minutes', () => {
        expect(() => formatTime(10, 30.5)).toThrow('Invalid time value');
      });

      it('should throw error with code INVALID_TIME_VALUE', () => {
        expect.assertions(1);
        try {
          formatTime(-1, 30);
        } catch (error) {
          expect(error).toHaveProperty('code', 'INVALID_TIME_VALUE');
        }
      });
    });
  });

  describe('Integration Tests', () => {
    it('should convert time to minutes and back to formatted string', () => {
      const time: TimeValue = { hours: 9, minutes: 30, period: 'AM' };
      const minutes = timeToMinutes(time);
      const hours24 = Math.floor(minutes / 60);
      const mins = minutes % 60;
      expect(formatTime(hours24, mins)).toBe('09:30');
    });

    it('should handle noon conversion correctly', () => {
      const time: TimeValue = { hours: 12, minutes: 0, period: 'PM' };
      const minutes = timeToMinutes(time);
      expect(minutes).toBe(720);
      expect(formatTime(12, 0)).toBe('12:00');
    });

    it('should handle midnight conversion correctly', () => {
      const time: TimeValue = { hours: 12, minutes: 0, period: 'AM' };
      const minutes = timeToMinutes(time);
      expect(minutes).toBe(0);
      expect(formatTime(0, 0)).toBe('00:00');
    });
  });
});
