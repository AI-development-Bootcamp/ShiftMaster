import { NewProject } from '../types/entities.js';

// Note: checking client_id and manager_user_id will be handled in the main seed script
// by looking up the inserted records. Here we define the content.

export const projects = [
    {
        clientIndex: 0, // TechFlow Solutions
        name: 'Cloud Migration Initiative',
        description: 'Migrating legacy systems to AWS cloud infrastructure.',
        start_date: '2025-01-15',
        time_format_type: 'start_end',
        active: true
    },
    {
        clientIndex: 0, // TechFlow Solutions
        name: 'Mobile App Refactor',
        description: 'Refactoring React Native app for better performance.',
        start_date: '2025-02-01',
        time_format_type: 'sum',
        active: true
    },
    {
        clientIndex: 1, // Quantum Systems
        name: 'AI Integration Platform',
        description: 'Building custom AI agents for customer support.',
        start_date: '2024-11-01',
        time_format_type: 'start_end',
        active: true
    }
] as const;
