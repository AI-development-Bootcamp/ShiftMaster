import { z } from 'zod';

export const clockInSchema = z.object({
  work_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Invalid time format (HH:MM:SS)'),
});

export const clockOutSchema = z.object({
  end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, 'Invalid time format (HH:MM:SS)'),
  task_id: z.string().min(1, 'Task ID is required'),
  location: z.enum(['Office', 'Client', 'Home'], {
    errorMap: () => ({ message: 'Location must be Office, Client, or Home' }),
  }),
});

export const timelineQuerySchema = z.object({
  user_id: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').optional(),
});
