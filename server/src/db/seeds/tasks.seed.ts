export const tasks = [
    {
        projectIndex: 0, // Cloud Migration
        name: 'Infrastructure Setup',
        description: 'Setting up VPCs, Subnets, and Security Groups.',
        start_date: '2025-01-15'
    },
    {
        projectIndex: 0, // Cloud Migration
        name: 'Database Migration',
        description: 'Moving PostgreSQL data to RDS.',
        start_date: '2025-01-20'
    },
    {
        projectIndex: 1, // Mobile App Refactor
        name: 'UI Components',
        description: 'Updating component library to new design system.',
        start_date: '2025-02-01'
    },
    {
        projectIndex: 2, // AI Integration
        name: 'Prompt Engineering',
        description: 'Optimizing LLM prompts for accuracy.',
        start_date: '2024-11-05'
    },
    {
        projectIndex: 2, // AI Integration
        name: 'Backend API',
        description: 'Developing FastAPI endpoints for model inference.',
        start_date: '2024-11-10'
    }
] as const;
