/**
 * Unit tests for authentication service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashPassword } from '../../utils/password.js';

// Mock Supabase client before importing modules that use it
vi.mock('../../db/supabase.js', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

// Import after mocking
import {
  authenticateUser,
  UserNotFoundError,
  AccountInactiveError,
  InvalidPasswordError,
} from '../../services/authService.js';
import { supabaseAdmin } from '../../db/supabase.js';

describe('AuthService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  describe('authenticateUser', () => {
    // ... (Keep success tests as is) ...
    it('should successfully authenticate user with valid credentials', async () => {
      const testPassword = 'SecurePassword123!';
      const passwordHash = await hashPassword(testPassword);

      const mockUser = {
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        full_name: 'John Doe',
        email: 'john@example.com',
        password_hash: passwordHash,
        role: 'regular' as const,
        job_title: 'Software Engineer',
        active: true,
        created_at: '2024-01-15T10:00:00Z',
      };

      // Mock Supabase query chain
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockUser,
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: mockSelect,
      });

      // Call authenticateUser
      const result = await authenticateUser('john@example.com', testPassword);

      // Verify Supabase was called correctly
      expect(supabaseAdmin.from).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith(
        'user_id, full_name, email, password_hash, role, job_title, active, created_at'
      );
      expect(mockEq).toHaveBeenCalledWith('email', 'john@example.com');
      expect(mockSingle).toHaveBeenCalled();

      // Verify returned user data
      expect(result).toEqual({
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        full_name: 'John Doe',
        email: 'john@example.com',
        role: 'regular',
        job_title: 'Software Engineer',
        active: true,
      });

      // Verify password_hash is not included in result
      expect(result).not.toHaveProperty('password_hash');
    });

    it('should successfully authenticate admin user', async () => {
      const testPassword = 'AdminPassword123!';
      const passwordHash = await hashPassword(testPassword);

      const mockAdmin = {
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        full_name: 'Admin User',
        email: 'admin@example.com',
        password_hash: passwordHash,
        role: 'admin' as const,
        active: true,
        created_at: '2024-01-15T10:00:00Z',
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockAdmin,
        error: null,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      const result = await authenticateUser('admin@example.com', testPassword);

      expect(result.role).toBe('admin');
      expect(result.user_id).toBe('550e8400-e29b-41d4-a716-446655440001');
    });

    it('should throw UserNotFoundError when user is not found', async () => {
      // Mock Supabase returning no user
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'User not found', code: 'PGRST116' },
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      await expect(
        authenticateUser('nonexistent@example.com', 'password')
      ).rejects.toThrow(UserNotFoundError);
    });

    it('should throw InvalidPasswordError when password is incorrect', async () => {
      const correctPassword = 'CorrectPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const passwordHash = await hashPassword(correctPassword);

      const mockUser = {
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        full_name: 'John Doe',
        email: 'john@example.com',
        password_hash: passwordHash,
        role: 'regular' as const,
        job_title: 'Software Engineer',
        active: true,
        created_at: '2024-01-15T10:00:00Z',
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockUser,
        error: null,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      await expect(
        authenticateUser('john@example.com', wrongPassword)
      ).rejects.toThrow(InvalidPasswordError);
    });

    it('should throw AccountInactiveError when user account is inactive', async () => {
      const testPassword = 'SecurePassword123!';
      const passwordHash = await hashPassword(testPassword);

      const mockInactiveUser = {
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        full_name: 'Inactive User',
        email: 'inactive@example.com',
        password_hash: passwordHash,
        role: 'regular' as const,
        active: false, // User is inactive
        created_at: '2024-01-15T10:00:00Z',
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockInactiveUser,
        error: null,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      await expect(
        authenticateUser('inactive@example.com', testPassword)
      ).rejects.toThrow(AccountInactiveError);
    });

    it('should throw UserNotFoundError on database error', async () => {
      // Mock database error
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database connection failed', code: 'DB_ERROR' },
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      // Note: Current implementation maps DB errors to UserNotFoundError
      await expect(
        authenticateUser('test@example.com', 'password')
      ).rejects.toThrow(UserNotFoundError);
    });

    it('should handle empty email', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Invalid input' },
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      // Note: Current implementation maps DB errors to UserNotFoundError
      await expect(authenticateUser('', 'password')).rejects.toThrow(
        UserNotFoundError
      );
    });

    it('should handle empty password by throwing InvalidPasswordError', async () => {
      const passwordHash = await hashPassword('ActualPassword');
      const mockUser = {
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        full_name: 'John Doe',
        email: 'john@example.com',
        password_hash: passwordHash,
        role: 'regular' as const,
        job_title: 'Software Engineer',
        active: true,
        created_at: '2024-01-15T10:00:00Z',
      };

      const mockSingle = vi.fn().mockResolvedValue({
        data: mockUser,
        error: null,
      });

      (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockSingle,
          }),
        }),
      });

      await expect(authenticateUser('john@example.com', '')).rejects.toThrow(
        InvalidPasswordError
      );
    });
  });
});
