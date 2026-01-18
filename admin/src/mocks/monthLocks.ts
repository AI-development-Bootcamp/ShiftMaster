import { MonthLock } from '@abra-shift-master/shared';

export const mockMonthLocks: MonthLock[] = [
    {
        lock_id: 1,
        year: 2024,
        month: 1, // January
        locked_at: '2024-02-05T09:00:00Z',
        locked_by: 1,
    },
    {
        lock_id: 2,
        year: 2024,
        month: 2, // February
        locked_at: '2024-03-05T09:00:00Z',
        locked_by: 1,
    },
];
