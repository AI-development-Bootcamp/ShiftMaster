import { AdminTaskAssignment } from '@abra-shift-master/shared';

export const mockAdminTaskAssignments: AdminTaskAssignment[] = [
    {
        admin_task_assignment_id: 'b50e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440000', // Daniel Mula
        task_id: '650e8400-e29b-41d4-a716-446655440000', // Frontend Dev
        assigned_by: '550e8400-e29b-41d4-a716-446655440000', // Self-assigned
        assigned_at: '2024-01-01T12:00:00Z',
        active: true,
    },
    {
        admin_task_assignment_id: 'b50e8400-e29b-41d4-a716-446655440001',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        task_id: '650e8400-e29b-41d4-a716-446655440001', // Backend Dev
        assigned_by: '550e8400-e29b-41d4-a716-446655440000',
        assigned_at: '2024-01-01T12:00:00Z',
        active: true,
    },
    {
        admin_task_assignment_id: 'b50e8400-e29b-41d4-a716-446655440002',
        user_id: '550e8400-e29b-41d4-a716-446655440001', // Israel Israeli
        task_id: '650e8400-e29b-41d4-a716-446655440001', // Backend Dev
        assigned_by: '550e8400-e29b-41d4-a716-446655440000', // Assigned by Admin
        assigned_at: '2024-01-02T10:00:00Z',
        active: true,
    },
    {
        admin_task_assignment_id: 'b50e8400-e29b-41d4-a716-446655440003',
        user_id: '550e8400-e29b-41d4-a716-446655440002', // Rachel Green
        task_id: '650e8400-e29b-41d4-a716-446655440002', // Design
        assigned_by: '550e8400-e29b-41d4-a716-446655440000',
        assigned_at: '2024-02-01T10:00:00Z',
        active: true,
    },
];
