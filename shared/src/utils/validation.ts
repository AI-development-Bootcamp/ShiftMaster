/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate time format (HH:MM)
 */
export function isValidTime(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const d = new Date(date);
  return d instanceof Date && !isNaN(d.getTime());
}

/**
 * Validate end time is after start time
 */
export function isEndTimeAfterStart(startTime: string, endTime: string): boolean {
  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return false;
  }

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  return endTotalMinutes > startTotalMinutes;
}

/**
 * Validate end date is after or equal to start date
 */
export function isEndDateAfterStart(startDate: string, endDate: string): boolean {
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    return false;
  }

  return new Date(endDate) >= new Date(startDate);
}

/**
 * Check if required fields are present and not empty
 */
export function validateRequired(
  data: Record<string, unknown>,
  fields: string[]
): { valid: boolean; missing: string[] } {
  const missing = fields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  return {
    valid: missing.length === 0,
    missing,
  };
}
