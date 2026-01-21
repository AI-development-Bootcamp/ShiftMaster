import { z } from 'zod';

export const createProjectSchema = z.object({
    body: z.object({
        client_id: z.string().uuid(),
        manager_user_id: z.string().uuid(),
        name: z.string().min(1),
        description: z.string().optional(),
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
        time_format_type: z.enum(['sum', 'start_end']),
        active: z.boolean().optional().default(true)
    })
});

export const updateProjectSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    }),
    body: z.object({
        client_id: z.string().uuid().optional(),
        manager_user_id: z.string().uuid().optional(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        time_format_type: z.enum(['sum', 'start_end']).optional(),
        active: z.boolean().optional()
    })
});

export const listProjectsSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        limit: z.string().optional(),
        search: z.string().optional(),
        sort: z.enum(['asc', 'desc']).optional(),
        include_inactive: z.enum(['true', 'false']).optional()
    })
});

export const getProjectSchema = z.object({
    params: z.object({
        id: z.string().uuid()
    })
});
