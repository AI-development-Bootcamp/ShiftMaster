import { Project, Task, ProjectTimeFormatType } from '@abra-shift-master/shared';

export const mockProjects: Project[] = [
    {
        project_id: '750e8400-e29b-41d4-a716-446655440000',
        client_id: '850e8400-e29b-41d4-a716-446655440000', // Bank Hapoalim
        manager_user_id: '550e8400-e29b-41d4-a716-446655440000', // Daniel Mula
        name: 'חידוש אפליקציית בנקאות',
        description: 'עיצוב מחדש ופיתוח אפליקציית מובייל',
        start_date: '2024-01-01',
        time_format_type: ProjectTimeFormatType.START_END,
        active: true,
        created_at: '2024-01-01T09:00:00Z',
    },
    {
        project_id: '750e8400-e29b-41d4-a716-446655440001',
        client_id: '850e8400-e29b-41d4-a716-446655440001', // Strauss
        manager_user_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'פורטל ספקים',
        description: 'מערכת לניהול הזמנות מספקים',
        start_date: '2024-02-01',
        time_format_type: ProjectTimeFormatType.SUM,
        active: true,
        created_at: '2024-01-20T09:00:00Z',
    },
    {
        project_id: '750e8400-e29b-41d4-a716-446655440002',
        client_id: '850e8400-e29b-41d4-a716-446655440003', // Abra
        manager_user_id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'מערכת משאבי אנוש',
        description: 'פלטפורמה לניהול עובדים וגיוס',
        start_date: '2024-02-01',
        time_format_type: ProjectTimeFormatType.SUM,
        active: true,
        created_at: '2024-01-20T09:00:00Z',
    },
];

export const mockTasks: Task[] = [
    // Project 1 Tasks
    {
        task_id: '650e8400-e29b-41d4-a716-446655440000',
        project_id: '750e8400-e29b-41d4-a716-446655440000',
        name: 'פיתוח Frontend',
        description: 'Implementing React Native screens',
        created_at: '2024-01-01T10:00:00Z',
    },
    {
        task_id: '650e8400-e29b-41d4-a716-446655440001',
        project_id: '750e8400-e29b-41d4-a716-446655440000',
        name: 'פיתוח Backend',
        description: 'API implementation',
        created_at: '2024-01-01T10:00:00Z',
    },
    // Project 2 Tasks
    {
        task_id: '650e8400-e29b-41d4-a716-446655440002',
        project_id: '750e8400-e29b-41d4-a716-446655440001',
        name: 'אפיון ועיצוב',
        created_at: '2024-02-01T10:00:00Z',
    },
    {
        task_id: '650e8400-e29b-41d4-a716-446655440003',
        project_id: '750e8400-e29b-41d4-a716-446655440002',
        name: 'פיתוח Frontend',
        description: 'Implementing React Native screens',
        created_at: '2024-01-01T10:00:00Z',
    },
];
