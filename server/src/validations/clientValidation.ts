import { z } from 'zod';

export const createClientSchema = z.object({
    name: z.string().min(1, 'Client name is required').trim(),
    contact_info: z.string().optional(),
});

export const updateClientSchema = z.object({
    name: z.string().min(1, 'Client name is required').trim().optional(),
    contact_info: z.string().optional(),
    active: z.boolean().optional(),
});

export const getClientSchema = z.object({
    id: z.string().uuid('Invalid client ID'),
});
