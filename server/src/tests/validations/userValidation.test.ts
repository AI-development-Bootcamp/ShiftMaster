/**
 * Tests for user validation schemas
 */

import { describe, it, expect } from 'vitest';
import { UserRole } from '@abra-shift-master/shared';
import {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  listUsersSchema,
} from '../../validations/userValidation.js';

describe('User Validation Schemas', () => {
  describe('createUserSchema', () => {
    it('should validate a valid user creation request', () => {
      const validData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: UserRole.REGULAR,
      };

      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });

    it('should validate with optional job_title', () => {
      const validData = {
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!',
        role: UserRole.ADMIN,
        job_title: 'Software Engineer',
      };

      const result = createUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.job_title).toBe('Software Engineer');
      }
    });

    it('should fail when full_name is missing', () => {
      const invalidData = {
        email: 'john@example.com',
        password: 'Password123!',
        role: UserRole.REGULAR,
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('full_name');
      }
    });

    it('should fail when email is invalid', () => {
      const invalidData = {
        full_name: 'John Doe',
        email: 'not-an-email',
        password: 'Password123!',
        role: UserRole.REGULAR,
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email format');
      }
    });

    it('should fail when password is too short', () => {
      const invalidData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'short',
        role: UserRole.REGULAR,
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });

    it('should fail when role is invalid', () => {
      const invalidData = {
        full_name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        role: 'invalid_role',
      };

      const result = createUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        // The error message will be about role, not password
        const roleError = result.error.issues.find(issue => issue.path.includes('role'));
        expect(roleError?.message).toContain('admin or regular');
      }
    });
  });

  describe('updateUserSchema', () => {
    it('should validate partial updates', () => {
      const validData = {
        full_name: 'Updated Name',
      };

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate multiple field updates', () => {
      const validData = {
        full_name: 'Updated Name',
        email: 'newemail@example.com',
        job_title: 'Senior Engineer',
      };

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate password update', () => {
      const validData = {
        password: 'NewPassword123!',
      };

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate active status update', () => {
      const validData = {
        active: false,
      };

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should fail when email is invalid', () => {
      const invalidData = {
        email: 'not-valid-email',
      };

      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Invalid email format');
      }
    });

    it('should fail when password is too short', () => {
      const invalidData = {
        password: '123',
      };

      const result = updateUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });

    it('should allow empty update object', () => {
      const validData = {};

      const result = updateUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('getUserSchema', () => {
    it('should validate a valid user ID', () => {
      const validData = {
        id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = getUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      }
    });

    it('should fail when ID is not a valid UUID', () => {
      const invalidData = {
        id: 'not-a-uuid',
      };

      const result = getUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('UUID');
      }
    });

    it('should fail when ID is numeric instead of UUID', () => {
      const invalidData = {
        id: '123',
      };

      const result = getUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should fail when ID is missing', () => {
      const invalidData = {};

      const result = getUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('listUsersSchema', () => {
    it('should use default values when not provided', () => {
      const validData = {};

      const result = listUsersSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should validate custom page and limit', () => {
      const validData = {
        page: '2',
        limit: '50',
      };

      const result = listUsersSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(50);
      }
    });

    it('should transform string values to numbers', () => {
      const validData = {
        page: '3',
        limit: '10',
      };

      const result = listUsersSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.page).toBe('number');
        expect(typeof result.data.limit).toBe('number');
      }
    });

    it('should fail when page is less than 1', () => {
      const invalidData = {
        page: '0',
      };

      const result = listUsersSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 1');
      }
    });

    it('should fail when limit exceeds 1000', () => {
      const invalidData = {
        limit: '1001',
      };

      const result = listUsersSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('between 1 and 1000');
      }
    });

    it('should fail when page is not numeric', () => {
      const invalidData = {
        page: 'abc',
      };

      const result = listUsersSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive integer');
      }
    });

    it('should fail when limit is not numeric', () => {
      const invalidData = {
        limit: 'xyz',
      };

      const result = listUsersSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive integer');
      }
    });
  });
});
