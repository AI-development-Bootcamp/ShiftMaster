export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    user_id: string
                    full_name: string
                    email: string
                    password_hash: string
                    role: 'admin' | 'regular'
                    job_title: string | null
                    active: boolean
                    created_at: string
                }
                Insert: {
                    user_id?: string
                    full_name: string
                    email: string
                    password_hash: string
                    role: 'admin' | 'regular'
                    job_title?: string | null
                    active?: boolean
                    created_at?: string
                }
                Update: {
                    user_id?: string
                    full_name?: string
                    email?: string
                    password_hash?: string
                    role?: 'admin' | 'regular'
                    job_title?: string | null
                    active?: boolean
                    created_at?: string
                }
            }
            clients: {
                Row: {
                    client_id: string
                    name: string
                    contact_info: string | null
                    active: boolean
                    created_at: string
                }
                Insert: {
                    client_id?: string
                    name: string
                    contact_info?: string | null
                    active?: boolean
                    created_at?: string
                }
                Update: {
                    client_id?: string
                    name?: string
                    contact_info?: string | null
                    active?: boolean
                    created_at?: string
                }
            }
            projects: {
                Row: {
                    project_id: string
                    client_id: string
                    manager_user_id: string
                    name: string
                    description: string | null
                    start_date: string
                    end_date: string | null
                    time_format_type: 'sum' | 'start_end'
                    active: boolean
                    created_at: string
                }
                Insert: {
                    project_id?: string
                    client_id: string
                    manager_user_id: string
                    name: string
                    description?: string | null
                    start_date: string
                    end_date?: string | null
                    time_format_type: 'sum' | 'start_end'
                    active?: boolean
                    created_at?: string
                }
                Update: {
                    project_id?: string
                    client_id?: string
                    manager_user_id?: string
                    name?: string
                    description?: string | null
                    start_date?: string
                    end_date?: string | null
                    time_format_type?: 'sum' | 'start_end'
                    active?: boolean
                    created_at?: string
                }
            }
            tasks: {
                Row: {
                    task_id: string
                    project_id: string
                    name: string
                    description: string | null
                    start_date: string | null
                    end_date: string | null
                    active: boolean
                    created_at: string
                }
                Insert: {
                    task_id?: string
                    project_id: string
                    name: string
                    description?: string | null
                    start_date?: string | null
                    end_date?: string | null
                    active?: boolean
                    created_at?: string
                }
                Update: {
                    task_id?: string
                    project_id?: string
                    name?: string
                    description?: string | null
                    start_date?: string | null
                    end_date?: string | null
                    active?: boolean
                    created_at?: string
                }
            }
            admin_task_assignments: {
                Row: {
                    admin_task_assignment_id: string
                    user_id: string
                    task_id: string
                    assigned_by: string
                    assigned_at: string
                    active: boolean
                    revoked_at: string | null
                }
                Insert: {
                    task_id?: string
                    assigned_by?: string
                    assigned_at?: string
                    active?: boolean
                    revoked_at?: string | null
                }
                Update: {
                    admin_task_assignment_id?: string
                    user_id?: string
                    task_id?: string
                    assigned_by?: string
                    assigned_at?: string
                    active?: boolean
                    revoked_at?: string | null
                }
            }
            entries: {
                Row: {
                    entry_id: string
                    user_id: string
                    entry_kind: 'work' | 'absence'
                    work_date: string
                    start_time: string | null
                    end_time: string | null
                    description: string | null
                    absence_type: 'sick' | 'vacation' | 'vacation_partial' | 'reserve' | 'other' | null
                    attachment_path: string | null
                    created_at: string
                    updated_at: string
                    last_modified_by: string | null
                    last_modified_at: string | null
                }
                Insert: {
                    entry_id?: string
                    user_id: string
                    entry_kind: 'work' | 'absence'
                    work_date: string
                    start_time?: string | null
                    end_time?: string | null
                    description?: string | null
                    absence_type?: 'sick' | 'vacation' | 'vacation_partial' | 'reserve' | 'other' | null
                    attachment_path?: string | null
                    created_at?: string
                    updated_at?: string
                    last_modified_by?: string | null
                    last_modified_at?: string | null
                }
                Update: {
                    entry_id?: string
                    user_id?: string
                    entry_kind?: 'work' | 'absence'
                    work_date?: string
                    start_time?: string | null
                    end_time?: string | null
                    description?: string | null
                    absence_type?: 'sick' | 'vacation' | 'vacation_partial' | 'reserve' | 'other' | null
                    attachment_path?: string | null
                    created_at?: string
                    updated_at?: string
                    last_modified_by?: string | null
                    last_modified_at?: string | null
                }
            }
            entry_assignments: {
                Row: {
                    entry_assignment_id: string
                    entry_id: string
                    task_id: string
                    location: 'Office' | 'Client' | 'Home'
                    start_time: string | null
                    end_time: string | null
                    duration_minutes: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    entry_assignment_id?: string
                    entry_id: string
                    task_id: string
                    location: 'Office' | 'Client' | 'Home'
                    start_time?: string | null
                    end_time?: string | null
                    duration_minutes?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    entry_assignment_id?: string
                    entry_id?: string
                    task_id?: string
                    location?: 'Office' | 'Client' | 'Home'
                    start_time?: string | null
                    end_time?: string | null
                    duration_minutes?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            month_locks: {
                Row: {
                    lock_id: string
                    year: number
                    month: number
                    locked_at: string
                    locked_by: string
                    unlocked_at: string | null
                }
                Insert: {
                    lock_id?: string
                    year: number
                    month: number
                    locked_at?: string
                    locked_by: string
                    unlocked_at?: string | null
                }
                Update: {
                    lock_id?: string
                    year?: number
                    month?: number
                    locked_at?: string
                    locked_by?: string
                    unlocked_at?: string | null
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: 'admin' | 'regular'
            project_time_format_type: 'sum' | 'start_end'
            entry_kind: 'work' | 'absence'
            absence_type: 'sick' | 'vacation' | 'vacation_partial' | 'reserve' | 'other'
            work_location: 'Office' | 'Client' | 'Home'
        }
    }
}
