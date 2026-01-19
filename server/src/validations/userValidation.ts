/**
 * Validation schemas for user management endpoints
 */

import { z } from 'zod';
import { UserRole } from '@abra-shift-master/shared';

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'Role must be either admin or regular' }),
  }),
  job_title: z.string().optional(),
});

/**
 * Schema for updating a user
 * All fields are optional except user_id is validated separately in route params
 */
export const updateUserSchema = z.object({
  full_name: z.string().min(1, 'Full name cannot be empty').optional(),
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  role: z
    .nativeEnum(UserRole, {
      errorMap: () => ({ message: 'Role must be either admin or regular' }),
    })
    .optional(),
  job_title: z.string().optional(),
  active: z.boolean().optional(),
});

/**
 * Schema for user ID parameter validation
 */
export const getUserSchema = z.object({
  id: z.string().regex(/^\d+$/, 'User ID must be a positive integer'),
});

/**
 * Schema for list users query parameters (pagination)
 */
export const listUsersSchema = z.object({
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
});

// Type exports for TypeScript
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GetUserParams = z.infer<typeof getUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersSchema>;
