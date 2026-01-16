import { Project, Task, ProjectTimeFormatType } from '@abra-shift-master/shared';

export const mockProjects: Project[] = [
    {
        project_id: 1,
        client_id: 1, // Bank Hapoalim
        manager_user_id: 1, // Daniel Mula
        name: 'חידוש אפליקציית בנקאות',
        description: 'עיצוב מחדש ופיתוח אפליקציית מובייל',
        start_date: '2024-01-01',
        time_format_type: ProjectTimeFormatType.START_END,
        active: true,
        created_at: '2024-01-01T09:00:00Z',
    },
    {
        project_id: 2,
        client_id: 2, // Strauss
        manager_user_id: 1,
        name: 'פורטל ספקים',
        description: 'מערכת לניהול הזמנות מספקים',
        start_date: '2024-02-01',
        time_format_type: ProjectTimeFormatType.SUM,
        active: true,
        created_at: '2024-01-20T09:00:00Z',
    },
];

export const mockTasks: Task[] = [
    // Project 1 Tasks
    {
        task_id: 1,
        project_id: 1,
        name: 'פיתוח Frontend',
        description: 'Implementing React Native screens',
        created_at: '2024-01-01T10:00:00Z',
    },
    {
        task_id: 2,
        project_id: 1,
        name: 'פיתוח Backend',
        description: 'API implementation',
        created_at: '2024-01-01T10:00:00Z',
    },
    // Project 2 Tasks
    {
        task_id: 3,
        project_id: 2,
        name: 'אפיון ועיצוב',
        created_at: '2024-02-01T10:00:00Z',
    },
];
