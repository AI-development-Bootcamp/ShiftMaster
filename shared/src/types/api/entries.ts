import { WorkLocation } from '../enums';

// Request types for work entries
export interface EntryAssignmentInput {
  task_id: string;
  location: WorkLocation | 'Office' | 'Client' | 'Home';
  start_time?: string | null; // HH:MM:SS format, required for start_end format
  end_time?: string | null; // HH:MM:SS format, required for start_end format
  duration_minutes?: number | null; // Required for sum format
}

export interface CreateWorkEntryRequest {
  work_date: string; // DATE format YYYY-MM-DD
  start_time?: string | null; // HH:MM:SS format
  end_time?: string | null; // HH:MM:SS format
  description?: string | null;
  assignments: EntryAssignmentInput[];
}

export interface GetEntriesQuery {
  start_date?: string; // YYYY-MM-DD
  end_date?: string; // YYYY-MM-DD
  year?: number;
  month?: number;
}

// Response types
export interface EntryAssignmentResponse {
  entry_assignment_id: string;
  entry_id: string;
  task_id: string;
  task_name: string; // Joined from tasks table
  project_id: string; // Joined from tasks table
  project_name: string; // Joined from projects table
  location: 'Office' | 'Client' | 'Home';
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export interface WorkEntryResponse {
  entry_id: string;
  user_id: string;
  entry_kind: 'work';
  work_date: string;
  start_time: string | null;
  end_time: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  last_modified_by: string | null;
  last_modified_at: string | null;
  assignments: EntryAssignmentResponse[];
}

export interface CreateWorkEntryResponse {
  success: true;
  data: {
    entry: WorkEntryResponse;
  };
}

export interface GetEntriesResponse {
  success: true;
  data: {
    entries: WorkEntryResponse[];
  };
}

// Force this file to be treated as a module
export {};
