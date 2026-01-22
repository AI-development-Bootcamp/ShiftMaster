// Error codes for time entries and absences
export const EntryErrorCode = {
  // Month lock errors
  MONTH_LOCKED: 'MONTH_LOCKED',

  // Task assignment errors
  TASK_NOT_ASSIGNED: 'TASK_NOT_ASSIGNED',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  TASK_INACTIVE: 'TASK_INACTIVE',

  // Time format errors
  TIME_FORMAT_MISMATCH: 'TIME_FORMAT_MISMATCH',
  INVALID_TIME_RANGE: 'INVALID_TIME_RANGE',
  MISSING_TIME_DATA: 'MISSING_TIME_DATA',
  MISSING_DURATION: 'MISSING_DURATION',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_DATE: 'INVALID_DATE',
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  FUTURE_DATE_NOT_ALLOWED: 'FUTURE_DATE_NOT_ALLOWED',
  INVALID_ABSENCE_TYPE: 'INVALID_ABSENCE_TYPE',
  MISSING_ASSIGNMENTS: 'MISSING_ASSIGNMENTS',

  // Duplicate entry errors
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  ENTRY_EXISTS: 'ENTRY_EXISTS',

  // Entry not found
  ENTRY_NOT_FOUND: 'ENTRY_NOT_FOUND',

  // Project errors
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  PROJECT_INACTIVE: 'PROJECT_INACTIVE',

  // Generic errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

export type EntryErrorCodeType = typeof EntryErrorCode[keyof typeof EntryErrorCode];

// Error detail interfaces for specific error types
export interface MonthLockedErrorDetails {
  year: number;
  month: number;
  locked_by: string;
  locked_at: string;
}

export interface TaskNotAssignedErrorDetails {
  task_id: string;
  task_name: string;
  user_id: string;
}

export interface TimeFormatMismatchErrorDetails {
  project_id: string;
  project_name: string;
  required_format: 'start_end' | 'sum';
  provided_format: 'start_end' | 'sum';
}

export interface ValidationErrorDetails {
  field: string;
  message: string;
  value?: unknown;
}

// Generic API error interface
export interface ApiError {
  code: EntryErrorCodeType | string;
  message: string;
  details?:
    | MonthLockedErrorDetails
    | TaskNotAssignedErrorDetails
    | TimeFormatMismatchErrorDetails
    | ValidationErrorDetails
    | Record<string, unknown>;
}

export interface ApiValidationError extends ApiError {
  code: typeof EntryErrorCode.VALIDATION_ERROR;
  details: ValidationErrorDetails;
}

// Force this file to be treated as a module
export {};
