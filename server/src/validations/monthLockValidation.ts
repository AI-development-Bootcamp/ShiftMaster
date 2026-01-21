/**
 * Validation schemas for month lock management endpoints
 */

import { z } from 'zod';

/**
 * Schema for list locks query parameter (year)
 */
export const listLocksSchema = z
  .object({
    year: z
      .union([z.string(), z.number()])
      .transform((val) => Number(val))
      .refine((val) => !isNaN(val), { message: 'Year must be a valid number' })
      .refine((val) => val >= 2000 && val <= 2100, {
        message: 'Year must be between 2000 and 2100',
      }),
  })
  .strict();

/**
 * Schema for batch update month locks
 */
export const batchUpdateLocksSchema = z
  .object({
    year: z
      .number()
      .int('Year must be an integer')
      .min(2000, 'Year must be at least 2000')
      .max(2100, 'Year must not exceed 2100'),
    operations: z.object({
      lock: z
        .array(
          z
            .number()
            .int('Month must be an integer')
            .min(1, 'Month must be between 1 and 12')
            .max(12, 'Month must be between 1 and 12')
        )
        .default([]),
      unlock: z
        .array(
          z
            .number()
            .int('Month must be an integer')
            .min(1, 'Month must be between 1 and 12')
            .max(12, 'Month must be between 1 and 12')
        )
        .default([]),
    }),
  })
  .strict();

// Type exports for TypeScript
export type ListLocksQuery = z.infer<typeof listLocksSchema>;
export type BatchUpdateLocksInput = z.infer<typeof batchUpdateLocksSchema>;
