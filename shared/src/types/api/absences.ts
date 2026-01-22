import { AbsenceType } from '../enums';

// Request types for absence entries
export interface CreateAbsenceEntryRequest {
  // Single-day absence
  work_date?: string; // YYYY-MM-DD (if single day)

  // Multi-day absence (date range)
  start_date?: string; // YYYY-MM-DD (if range)
  end_date?: string; // YYYY-MM-DD (if range)

  absence_type: AbsenceType | 'sick' | 'vacation' | 'vacation_partial' | 'reserve' | 'other';
  description?: string | null;
  attachment_path?: string | null; // Future: for file uploads
}

export interface GetAbsencesQuery {
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  year?: number;
  month?: number;
  absence_type?: AbsenceType | 'sick' | 'vacation' | 'vacation_partial' | 'reserve' | 'other';
}

// Response types
export interface AbsenceEntryResponse {
  entry_id: string;
  user_id: string;
  entry_kind: 'absence';
  work_date: string;
  absence_type: 'sick' | 'vacation' | 'vacation_partial' | 'reserve' | 'other';
  description: string | null;
  attachment_path: string | null;
  created_at: string;
  updated_at: string;
  last_modified_by: string | null;
  last_modified_at: string | null;
}

export interface CreateAbsenceEntryResponse {
  success: true;
  data: {
    entries: AbsenceEntryResponse[]; // Array because multi-day ranges create multiple entries
  };
}

export interface GetAbsencesResponse {
  success: true;
  data: {
    absences: AbsenceEntryResponse[];
  };
}

// Force this file to be treated as a module
export {};
