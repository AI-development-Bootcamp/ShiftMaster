import { User, UserRole } from '@abra-shift-master/shared';

export const mockUsers: User[] = [
    {
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        full_name: 'דניאל מולטא',
        email: 'daniel@abra.com',
        role: UserRole.ADMIN,
        job_title: 'ראש צוות פיתוח',
        active: true,
        created_at: '2024-01-01T08:00:00Z',
    },
    {
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        full_name: 'ישראל ישראלי',
        email: 'israel@abra.com',
        role: UserRole.REGULAR,
        job_title: 'מפתח Full Stack',
        active: true,
        created_at: '2024-01-02T09:00:00Z',
    },
    {
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        full_name: 'רחל גרין',
        email: 'rachel@abra.com',
        role: UserRole.REGULAR,
        job_title: 'מעצבת UI/UX',
        active: true,
        created_at: '2024-01-03T10:00:00Z',
    },
];

export const mockCurrentUser = mockUsers[0];
