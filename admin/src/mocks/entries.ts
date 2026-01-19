import { Entry, EntryAssignment, EntryKind, WorkLocation } from '@abra-shift-master/shared';

// Helper to create date object (UTC)
const createDate = (dateStr: string) => new Date(dateStr).toISOString();

export const mockEntries: Entry[] = [
    // Entry 1: Regular work day for User 1 (Daniel)
    {
        entry_id: 1,
        user_id: 1,
        entry_kind: EntryKind.WORK,
        work_date: '2024-03-10',
        start_time: '09:00',
        end_time: '18:00',
        description: 'Working on project infrastructure',
        created_at: createDate('2024-03-10T18:00:00Z'),
    },
    // Entry 2: Work day for User 2 (Israel)
    {
        entry_id: 2,
        user_id: 2,
        entry_kind: EntryKind.WORK,
        work_date: '2024-03-10',
        start_time: '08:30',
        end_time: '17:30',
        description: 'API Integration',
        created_at: createDate('2024-03-10T17:30:00Z'),
    },
];

export const mockEntryAssignments: EntryAssignment[] = [
    // Assignments for Entry 1
    {
        entry_assignment_id: 1,
        entry_id: 1,
        task_id: 1, // Frontend Dev (Start/End project)
        location: WorkLocation.OFFICE,
        start_time: '09:00',
        end_time: '13:00',
        created_at: createDate('2024-03-10T13:00:00Z'),
    },
    {
        entry_assignment_id: 2,
        entry_id: 1,
        task_id: 2, // Backend Dev (Start/End project)
        location: WorkLocation.OFFICE,
        start_time: '14:00',
        end_time: '18:00',
        created_at: createDate('2024-03-10T18:00:00Z'),
    },
    // Assignments for Entry 2
    {
        entry_assignment_id: 3,
        entry_id: 2,
        task_id: 3, // Design (Sum project)
        location: WorkLocation.HOME,
        duration_minutes: 540, // 9 hours
        created_at: createDate('2024-03-10T17:30:00Z'),
    },
];
