/**
 * Date utility functions
 */

/**
 * Format date to YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format time to HH:MM
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * Check if date is weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const day = d.getDay();
  return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Get date range between two dates (inclusive)
 */
export function getDateRange(start: Date | string, end: Date | string): Date[] {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  const dates: Date[] = [];

  const current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Get weekdays in date range (excludes weekends)
 */
export function getWeekdaysInRange(
  start: Date | string,
  end: Date | string
): Date[] {
  return getDateRange(start, end).filter((date) => !isWeekend(date));
}

/**
 * Calculate duration in minutes between two times
 * Returns 0 if endTime is null/empty (overnight shift crossing midnight)
 */
export function calculateDuration(
  startTime: string,
  endTime: string | null | undefined
): number {
  // If end_time is null/empty, it's an overnight shift - return 0
  if (!endTime || endTime.trim() === '') {
    return 0;
  }

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  // If end time is before start time, it's an overnight shift - return 0
  if (endTotalMinutes < startTotalMinutes) {
    return 0;
  }

  return endTotalMinutes - startTotalMinutes;
}

/**
 * Convert minutes to hours and minutes string
 */
export function minutesToHoursString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${String(mins).padStart(2, '0')}`;
}
