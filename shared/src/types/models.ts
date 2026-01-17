import {
  UserRole,
  ProjectTimeFormatType,
  EntryKind,
  AbsenceType,
  WorkLocation,
} from './enums';

// User model
/**
 * Represents a user in the system.
 */
export interface User {
  user_id: number;
  full_name: string;
  email: string;
  role: UserRole;
  job_title: string;
  active: boolean;
  created_at: string;
}

// Client model
/**
 * Represents a client entity.
 */
export interface Client {
  client_id: number;
  name: string;
  contact_info?: string;
  active: boolean;
  created_at: string;
}

// Project model
/**
 * Represents a project associated with a client.
 */
export interface Project {
  project_id: number;
  client_id: number;
  manager_user_id: number;
  name: string;
  description?: string;
  start_date: string;
  end_date?: string;
  time_format_type: ProjectTimeFormatType;
  active: boolean;
  created_at: string;
}

// Task model
/**
 * Represents a task within a project.
 */
export interface Task {
  task_id: number;
  project_id: number;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
}

// Admin Task Assignment model
/**
 * Represents an assignment of a task to a user by an admin.
 */
export interface AdminTaskAssignment {
  admin_task_assignment_id: number;
  user_id: number;
  task_id: number;
  assigned_by: number;
  assigned_at: string;
  active: boolean;
  revoked_at?: string;
}

// Entry model
/**
 * Represents a work entry or absence record.
 */
export interface Entry {
  entry_id: number;
  user_id: number;
  entry_kind: EntryKind;
  work_date: string;
  start_time?: string;
  end_time?: string;
  description?: string;
  absence_type?: AbsenceType;
  attachment_path?: string;
  created_at: string;
  updated_at?: string;
  last_modified_by?: number;
  last_modified_at?: string;
}

// Entry Assignment model
/**
 * Represents a specific assignment of time within an entry to a task.
 */
export interface EntryAssignment {
  entry_assignment_id: number;
  entry_id: number;
  task_id: number;
  location: WorkLocation;
  start_time?: string;
  end_time?: string;
  duration_minutes?: number;
  created_at: string;
  updated_at?: string;
}

// Month Lock model
/**
 * Represents a lock on a specific month to prevent further edits.
 */
export interface MonthLock {
  lock_id: number;
  year: number;
  month: number;
  locked_at: string;
  locked_by: number;
  unlocked_at?: string;
}
