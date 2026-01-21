// Database enums matching the schema

export enum UserRole {
  ADMIN = 'admin',
  REGULAR = 'regular',
}

export enum ProjectTimeFormatType {
  SUM = 'sum',
  START_END = 'start_end',
}

export enum EntryKind {
  WORK = 'work',
  ABSENCE = 'absence',
}

export enum AbsenceType {
  SICK = 'sick',
  VACATION = 'vacation',
  VACATION_PARTIAL = 'vacation_partial',
  RESERVE = 'reserve',
  OTHER = 'other',
}

export enum WorkLocation {
  OFFICE = 'Office',
  CLIENT = 'Client',
  HOME = 'Home',
}

export enum UserApiErrorCode {
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FORBIDDEN = 'FORBIDDEN',
  UNAUTHORIZED = 'UNAUTHORIZED',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}
