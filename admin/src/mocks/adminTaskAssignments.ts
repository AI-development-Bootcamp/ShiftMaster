import { AdminTaskAssignment } from '@abra-shift-master/shared';

export const mockAdminTaskAssignments: AdminTaskAssignment[] = [
    {
        admin_task_assignment_id: 1,
        user_id: 1, // Daniel Mula
        task_id: 1, // Frontend Dev
        assigned_by: 1, // Self-assigned
        assigned_at: '2024-01-01T12:00:00Z',
        active: true,
    },
    {
        admin_task_assignment_id: 2,
        user_id: 1,
        task_id: 2, // Backend Dev
        assigned_by: 1,
        assigned_at: '2024-01-01T12:00:00Z',
        active: true,
    },
    {
        admin_task_assignment_id: 3,
        user_id: 2, // Israel Israeli
        task_id: 2, // Backend Dev
        assigned_by: 1, // Assigned by Admin
        assigned_at: '2024-01-02T10:00:00Z',
        active: true,
    },
    {
        admin_task_assignment_id: 4,
        user_id: 3, // Rachel Green
        task_id: 3, // Design
        assigned_by: 1,
        assigned_at: '2024-02-01T10:00:00Z',
        active: true,
    },
];
