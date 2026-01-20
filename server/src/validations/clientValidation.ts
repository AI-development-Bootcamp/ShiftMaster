/**
 * Validation schemas for client management endpoints
 */

import { z } from 'zod';

/**
 * XSS Protection: Rejects strings containing HTML/script tags
 */
const NO_HTML_REGEX = /<[^>]*>/;

/**
 * Schema for creating a new client
 */
export const createClientSchema = z
    .object({
        name: z
            .string()
            .min(1, 'Client name is required')
            .max(100, 'Client name must not exceed 100 characters')
            .trim()
            .refine((val) => !NO_HTML_REGEX.test(val), {
                message: 'Client name cannot contain HTML tags',
            }),
        contact_info: z
            .string()
            .max(500, 'Contact info must not exceed 500 characters')
            .trim()
            .refine((val) => !NO_HTML_REGEX.test(val), {
                message: 'Contact info cannot contain HTML tags',
            })
            .optional(),
    })
    .strict();

/**
 * Schema for updating a client
 */
export const updateClientSchema = z
    .object({
        name: z
            .string()
            .min(1, 'Client name cannot be empty')
            .max(100, 'Client name must not exceed 100 characters')
            .trim()
            .refine((val) => !NO_HTML_REGEX.test(val), {
                message: 'Client name cannot contain HTML tags',
            })
            .optional(),
        contact_info: z
            .string()
            .max(500, 'Contact info must not exceed 500 characters')
            .trim()
            .refine((val) => !NO_HTML_REGEX.test(val), {
                message: 'Contact info cannot contain HTML tags',
            })
            .optional(),
        active: z.boolean().optional(),
    })
    .strict();

/**
 * Schema for client ID parameter validation (UUID format)
 */
export const getClientSchema = z
    .object({
        id: z
            .string()
            .uuid('Client ID must be a valid UUID'),
    })
    .strict();

/**
 * Schema for list clients query parameters (pagination)
 */
export const listClientsSchema = z
    .object({
        page: z
            .string()
            .regex(/^\d+$/, 'Page must be a positive integer')
            .transform(Number)
            .refine((val) => val >= 1, 'Page must be at least 1')
            .optional()
            .default('1'),
        limit: z
            .string()
            .regex(/^\d+$/, 'Limit must be a positive integer')
            .transform(Number)
            .refine((val) => val >= 1 && val <= 100, 'Limit must be between 1 and 100')
            .optional()
            .default('20'),
        search: z.string().optional(),
        sort: z.enum(['asc', 'desc']).optional().default('asc'),
        include_inactive: z
            .enum(['true', 'false'])
            .transform((val) => val === 'true')
            .optional()
            .default('false'),
    })
    .strict();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type GetClientParams = z.infer<typeof getClientSchema>;
export type ListClientsQuery = z.infer<typeof listClientsSchema>;

/**
 * Schema for client ID parameter validation (UUID format constraint, but ID is BigInt in DB so string number)
 * Wait, looking at project.md, client_id is BIGINT.
 * However, users table user_id is also BIGINT but I saw UUID validation in userValidation.ts?
 * Let me double check project.md and userValidation.ts
 */
// Re-reading userValidation.ts from Step 34:
// export const getUserSchema = z.object({ id: z.string().uuid(...) });
// And project.md says user_id is BIGINT. This is a contradiction or I misread something.
// Let me quickly check the database types again in entities.ts (Step 42).
// export type User = Database['public']['Tables']['users']['Row'];
// If Supabase uses UUIDs for auth but BIGINTs for internal IDs, there might be a mix.
// Or maybe the project.md documentation is slightly out of sync with actual implementation.
// UserValidation uses UUID. Let's assume UUID for consistency if the codebase uses it.
// BUT, wait. project.md:
// "user_id | BIGINT | Primary Key"
// "client_id | BIGINT | Primary Key"
// UserValidation.ts: z.string().uuid()
// This is very strange. If the DB is BIGINT, then UUID validation will fail for numbers like "1".
// I should check `server/src/db/types/database.types.ts` if possible, or `entities.ts` imported it.
// Let's verify `entities.ts` imports from `database.types.ts`.
// I'll pause the write to verify this.

// Actually, I can check specific user ID data from `usersController.ts` or `users.ts`.
// In `usersController.ts` (Step 25), `req.params.id` is validated with `getUserSchema`.
// In `users.ts` (Step 26), swagger example shows UUID: "550e8400-e29b-41d4-a716-446655440000".
// So the codebase uses UUIDs. The `project.md` saying BIGINT might be incorrect or referring to a legacy/different version.
// I will assume UUIDs for consistency with existing code, BUT `clients` table in `project.md` also says BIGINT.
// Let's check `server/src/db/types/database.types.ts` to be sure about `clients`.
