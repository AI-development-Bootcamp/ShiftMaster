import type { Database } from './database.types.js';

// Enums
export type UserRole = Database['public']['Enums']['user_role'];
export type ProjectTimeFormatType = Database['public']['Enums']['project_time_format_type'];
export type EntryKind = Database['public']['Enums']['entry_kind'];
export type AbsenceType = Database['public']['Enums']['absence_type'];
export type WorkLocation = Database['public']['Enums']['work_location'];

// Users
export type User = Database['public']['Tables']['users']['Row'];
export type NewUser = Database['public']['Tables']['users']['Insert'];
export type UpdateUser = Database['public']['Tables']['users']['Update'];

// Clients
export type Client = Database['public']['Tables']['clients']['Row'];
export type NewClient = Database['public']['Tables']['clients']['Insert'];
export type UpdateClient = Database['public']['Tables']['clients']['Update'];

// Projects
export type Project = Database['public']['Tables']['projects']['Row'];
export type NewProject = Database['public']['Tables']['projects']['Insert'];
export type UpdateProject = Database['public']['Tables']['projects']['Update'];

// Tasks
export type Task = Database['public']['Tables']['tasks']['Row'];
export type NewTask = Database['public']['Tables']['tasks']['Insert'];
export type UpdateTask = Database['public']['Tables']['tasks']['Update'];

// Admin Task Assignments
export type AdminTaskAssignment = Database['public']['Tables']['admin_task_assignments']['Row'];
export type NewAdminTaskAssignment = Database['public']['Tables']['admin_task_assignments']['Insert'];
export type UpdateAdminTaskAssignment = Database['public']['Tables']['admin_task_assignments']['Update'];

// Entries
export type Entry = Database['public']['Tables']['entries']['Row'];
export type NewEntry = Database['public']['Tables']['entries']['Insert'];
export type UpdateEntry = Database['public']['Tables']['entries']['Update'];

// Entry Assignments
export type EntryAssignment = Database['public']['Tables']['entry_assignments']['Row'];
export type NewEntryAssignment = Database['public']['Tables']['entry_assignments']['Insert'];
export type UpdateEntryAssignment = Database['public']['Tables']['entry_assignments']['Update'];

// Month Locks
export type MonthLock = Database['public']['Tables']['month_locks']['Row'];
export type NewMonthLock = Database['public']['Tables']['month_locks']['Insert'];
export type UpdateMonthLock = Database['public']['Tables']['month_locks']['Update'];
