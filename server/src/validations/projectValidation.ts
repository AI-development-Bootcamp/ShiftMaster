import { z } from 'zod';

export const createProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required').trim(),
    client_id: z.string().uuid('Invalid client ID'),
    manager_user_id: z.string().uuid('Invalid manager user ID').optional(),
    description: z.string().optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format (YYYY-MM-DD)'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format (YYYY-MM-DD)').optional(),
    time_format_type: z.enum(['sum', 'start_end']).default('sum'),
});

export const updateProjectSchema = z.object({
    name: z.string().min(1, 'Project name is required').trim().optional(),
    client_id: z.string().uuid('Invalid client ID').optional(),
    manager_user_id: z.string().uuid('Invalid manager user ID').optional(),
    description: z.string().optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format (YYYY-MM-DD)').optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format (YYYY-MM-DD)').optional(),
    time_format_type: z.enum(['sum', 'start_end']).optional(),
    active: z.boolean().optional(),
});

export const getProjectSchema = z.object({
    id: z.string().uuid('Invalid project ID'),
});
