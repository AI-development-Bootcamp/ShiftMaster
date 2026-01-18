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
 * Validate date format (YYYY-MM-DD) and ensure it's a valid calendar date
 */
export function isValidDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  // Parse year, month, and day from the string
  const parts = date.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  // Check for NaN values
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return false;
  }

  // Construct Date using parsed values (month is 0-indexed in Date constructor)
  const d = new Date(year, month - 1, day);

  // Verify the constructed Date's year, month (plus 1), and day match the parsed values
  // This catches invalid dates like "2024-02-30" which would auto-correct to March 1st
  if (
    d.getFullYear() !== year ||
    d.getMonth() + 1 !== month ||
    d.getDate() !== day
  ) {
    return false;
  }

  return true;
}

/**
 * Validate end time is after start time
 * Returns true if endTime is null/empty (overnight shift crossing midnight)
 * Returns false if endTime is before startTime (user should use null/empty for overnight shifts)
 */
export function isEndTimeAfterStart(
  startTime: string,
  endTime: string | null | undefined
): boolean {
  // If end_time is null/empty, it's an overnight shift - allow it
  if (!endTime || endTime.trim() === '') {
    return true;
  }

  if (!isValidTime(startTime) || !isValidTime(endTime)) {
    return false;
  }

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  // If end time is before start time, it's invalid - user should use null/empty for overnight shifts
  if (endTotalMinutes < startTotalMinutes) {
    return false;
  }

  return endTotalMinutes > startTotalMinutes;
}

/**
 * Validate end date is after or equal to start date
 */
export function isEndDateAfterStart(
  startDate: string,
  endDate: string
): boolean {
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
