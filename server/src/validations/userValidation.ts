/**
 * Validation schemas for user management endpoints
 */

import { z } from 'zod';
import { UserRole } from '@abra-shift-master/shared';

/**
 * XSS Protection: Rejects strings containing HTML/script tags
 */
const NO_HTML_REGEX = /<[^>]*>/;

/**
 * Password validation regex patterns
 */
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 128;
const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

/**
 * Schema for creating a new user
 */
export const createUserSchema = z
  .object({
    full_name: z
      .string()
      .min(1, 'Full name is required')
      .max(100, 'Full name must not exceed 100 characters')
      .trim()
      .refine((val) => !NO_HTML_REGEX.test(val), {
        message: 'Full name cannot contain HTML tags',
      }),
    email: z
      .string()
      .email('Invalid email format')
      .max(255, 'Email must not exceed 255 characters')
      .toLowerCase()
      .trim(),
    password: passwordSchema,
    role: z.nativeEnum(UserRole, {
      errorMap: () => ({ message: 'Role must be either admin or regular' }),
    }),
    job_title: z
      .string()
      .max(100, 'Job title must not exceed 100 characters')
      .trim()
      .refine((val) => !NO_HTML_REGEX.test(val), {
        message: 'Job title cannot contain HTML tags',
      })
      .optional(),
  })
  .strict();

/**
 * Schema for updating a user
 * All fields are optional except user_id is validated separately in route params
 */
export const updateUserSchema = z
  .object({
    full_name: z
      .string()
      .min(1, 'Full name cannot be empty')
      .max(100, 'Full name must not exceed 100 characters')
      .trim()
      .refine((val) => !NO_HTML_REGEX.test(val), {
        message: 'Full name cannot contain HTML tags',
      })
      .optional(),
    email: z
      .string()
      .email('Invalid email format')
      .max(255, 'Email must not exceed 255 characters')
      .toLowerCase()
      .trim()
      .optional(),
    password: passwordSchema.optional(),
    role: z
      .nativeEnum(UserRole, {
        errorMap: () => ({ message: 'Role must be either admin or regular' }),
      })
      .optional(),
    job_title: z
      .string()
      .max(100, 'Job title must not exceed 100 characters')
      .trim()
      .refine((val) => !NO_HTML_REGEX.test(val), {
        message: 'Job title cannot contain HTML tags',
      })
      .optional(),
    active: z.boolean().optional(),
  })
  .strict();

/**
 * Schema for user ID parameter validation (UUID format)
 */
export const getUserSchema = z
  .object({
    id: z
      .string()
      .uuid('User ID must be a valid UUID'),
  })
  .strict();

/**
 * Schema for list users query parameters (pagination)
 */
export const listUsersSchema = z
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
  })
  .strict();

// Type exports for TypeScript
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type GetUserParams = z.infer<typeof getUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersSchema>;
