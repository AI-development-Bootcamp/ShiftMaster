import { z } from 'zod';

export const createTaskSchema = z.object({
    name: z.preprocess(
        (v) => (typeof v === 'string' ? v.trim() : v),
        z.string().min(1, 'Task name is required')
    ),
    project_id: z.string().uuid('Invalid project ID'),
    description: z.string().optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format (YYYY-MM-DD)').optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format (YYYY-MM-DD)').optional(),
});

export const updateTaskSchema = z.object({
    name: z.preprocess(
        (v) => (typeof v === 'string' ? v.trim() : v),
        z.string().min(1, 'Task name is required')
    ).optional(),
    project_id: z.string().uuid('Invalid project ID').optional(),
    description: z.string().optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid start date format (YYYY-MM-DD)').optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid end date format (YYYY-MM-DD)').optional(),
    active: z.boolean().optional(),
});

export const getTaskSchema = z.object({
    id: z.string().uuid('Invalid task ID'),
});
