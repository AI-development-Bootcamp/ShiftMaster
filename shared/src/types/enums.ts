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
