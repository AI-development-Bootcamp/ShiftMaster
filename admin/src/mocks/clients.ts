import { Client } from '@abra-shift-master/shared';

export const mockClients: Client[] = [
    {
        client_id: 1,
        name: 'בנק הפועלים',
        contact_info: 'תל אביב, סניף ראשי',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
    },
    {
        client_id: 2,
        name: 'שטראוס גרופ',
        contact_info: 'פתח תקווה, אזור תעשייה',
        active: true,
        created_at: '2024-01-15T00:00:00Z',
    },
    {
        client_id: 3,
        name: 'מיקרוסופט ישראל',
        contact_info: 'הרצליה פיתוח',
        active: true,
        created_at: '2024-02-01T00:00:00Z',
    },
];
