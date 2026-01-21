/**
 * Tests for UsersService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  UsersService,
  DuplicateEmailError,
  UserNotFoundError,
} from '../../services/usersService.js';
import { User } from '../../db/types/entities.js';
import * as passwordUtils from '../../utils/password.js';

// Mock the UserRepository
vi.mock('../../db/repositories/UserRepository.js', () => {
  return {
    UserRepository: vi.fn(() => ({
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByEmail: vi.fn(),
      findPaginated: vi.fn(),
    })),
  };
});

// Mock password utilities
vi.mock('../../utils/password.js', () => ({
  hashPassword: vi.fn(),
}));

describe('UsersService', () => {
  let usersService: UsersService;
  let mockUserRepo: {
    create: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    findByEmail: ReturnType<typeof vi.fn>;
    findPaginated: ReturnType<typeof vi.fn>;
  };

  const mockUser: User = {
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    last_modified_by: null,
    full_name: 'John Doe',
    email: 'john@example.com',
    password_hash: 'hashed_password',
    role: 'regular',
    job_title: 'Engineer',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock Supabase client
    const mockSupabaseClient = {} as SupabaseClient;

    // Create service instance with mock client
    usersService = new UsersService(mockSupabaseClient);

    // Get mock repository instance (accessing private property for testing)
    mockUserRepo = (
      usersService as unknown as { userRepo: typeof mockUserRepo }
    ).userRepo;

    // Setup default mock behaviors
    vi.mocked(passwordUtils.hashPassword).mockResolvedValue('hashed_password');
  });

  describe('createUser', () => {
    const newUserData = {
      full_name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      role: 'admin' as const,
      job_title: 'Manager',
    };

    it('should create a new user successfully', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue({
        ...mockUser,
        user_id: '223e4567-e89b-12d3-a456-426614174001',
        full_name: newUserData.full_name,
        email: newUserData.email,
        role: newUserData.role,
      });

      const actor = { role: 'admin' as const };
      const result = await usersService.createUser(actor, newUserData);

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(newUserData.email);
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith(
        newUserData.password
      );
      expect(mockUserRepo.create).toHaveBeenCalledWith({
        full_name: newUserData.full_name,
        email: newUserData.email,
        password_hash: 'hashed_password',
        role: newUserData.role,
        job_title: newUserData.job_title,
        active: true,
      });
      expect(result).not.toHaveProperty('password_hash');
      expect(result.email).toBe(newUserData.email);
    });

    it('should throw DuplicateEmailError if email exists', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(mockUser);

      const actor = { role: 'admin' as const };
      await expect(usersService.createUser(actor, newUserData)).rejects.toThrow(
        DuplicateEmailError
      );
      expect(mockUserRepo.create).not.toHaveBeenCalled();
    });

    it('should create user without job_title if not provided', async () => {
      const dataWithoutJobTitle = {
        ...newUserData,
        job_title: undefined,
      };

      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.create.mockResolvedValue(mockUser);

      const actor = { role: 'admin' as const };
      await usersService.createUser(actor, dataWithoutJobTitle);

      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          job_title: undefined,
        })
      );
    });
  });

  describe('listUsers', () => {
    const mockUsers: User[] = [
      {
        ...mockUser,
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        email: 'user1@example.com',
      },
      {
        ...mockUser,
        user_id: '123e4567-e89b-12d3-a456-426614174002',
        email: 'user2@example.com',
      },
      {
        ...mockUser,
        user_id: '123e4567-e89b-12d3-a456-426614174003',
        email: 'user3@example.com',
      },
      {
        ...mockUser,
        user_id: '123e4567-e89b-12d3-a456-426614174004',
        email: 'user4@example.com',
      },
      {
        ...mockUser,
        user_id: '123e4567-e89b-12d3-a456-426614174005',
        email: 'user5@example.com',
      },
    ];

    it('should return paginated users with default pagination', async () => {
      mockUserRepo.findPaginated.mockResolvedValue({
        data: mockUsers,
        count: 5,
      });

      const actor = { role: 'admin' as const };
      const result = await usersService.listUsers(actor);

      expect(mockUserRepo.findPaginated).toHaveBeenCalledWith(1, 20, undefined);
      expect(result.users).toHaveLength(5);
      expect(result.pagination).toEqual({
        total: 5,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(result.users[0]).not.toHaveProperty('password_hash');
    });

    it('should return correct page with custom pagination', async () => {
      const page2Users = [
        {
          ...mockUser,
          user_id: '123e4567-e89b-12d3-a456-426614174003',
          email: 'user3@example.com',
        },
        {
          ...mockUser,
          user_id: '123e4567-e89b-12d3-a456-426614174004',
          email: 'user4@example.com',
        },
      ];

      mockUserRepo.findPaginated.mockResolvedValue({
        data: page2Users,
        count: 5,
      });

      const actor = { role: 'admin' as const };
      const result = await usersService.listUsers(actor, 2, 2);

      expect(mockUserRepo.findPaginated).toHaveBeenCalledWith(2, 2, undefined);
      expect(result.users).toHaveLength(2);
      expect(result.users[0].user_id).toBe(
        '123e4567-e89b-12d3-a456-426614174003'
      );
      expect(result.users[1].user_id).toBe(
        '123e4567-e89b-12d3-a456-426614174004'
      );
      expect(result.pagination).toEqual({
        total: 5,
        page: 2,
        limit: 2,
        totalPages: 3,
      });
    });

    it('should return empty array for page beyond total', async () => {
      mockUserRepo.findPaginated.mockResolvedValue({
        data: [],
        count: 5,
      });

      const actor = { role: 'admin' as const };
      const result = await usersService.listUsers(actor, 10, 20);

      expect(mockUserRepo.findPaginated).toHaveBeenCalledWith(10, 20, undefined);
      expect(result.users).toHaveLength(0);
      expect(result.pagination.total).toBe(5);
      expect(result.pagination.page).toBe(10);
      expect(result.pagination.limit).toBe(20);
    });

    it('should pass filters to repository', async () => {
      const actor = { role: 'admin' as const };
      const filters = { active: true, search: 'test' };

      await usersService.listUsers(actor, 1, 20, filters);

      expect(mockUserRepo.findPaginated).toHaveBeenCalledWith(1, 20, filters);
    });

    it('should exclude password_hash from all users', async () => {
      mockUserRepo.findPaginated.mockResolvedValue({
        data: mockUsers,
        count: 5,
      });

      const actor = { role: 'admin' as const };
      const result = await usersService.listUsers(actor);

      result.users.forEach((user) => {
        expect(user).not.toHaveProperty('password_hash');
      });
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const result = await usersService.getUserById(
        '123e4567-e89b-12d3-a456-426614174000'
      );

      expect(mockUserRepo.findById).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000'
      );
      expect(result).not.toHaveProperty('password_hash');
      expect(result.user_id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw UserNotFoundError if user does not exist', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(
        usersService.getUserById('999e4567-e89b-12d3-a456-426614174999')
      ).rejects.toThrow(UserNotFoundError);
    });
  });

  describe('updateUser', () => {
    const updates = {
      full_name: 'Updated Name',
      job_title: 'Senior Engineer',
    };

    it('should update user successfully', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue({ ...mockUser, ...updates });

      const actor = { role: 'admin' as const };
      const result = await usersService.updateUser(
        actor,
        '123e4567-e89b-12d3-a456-426614174000',
        updates
      );

      expect(mockUserRepo.findById).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000'
      );
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        updates
      );
      expect(result).not.toHaveProperty('password_hash');
      expect(result.full_name).toBe(updates.full_name);
    });

    it('should throw UserNotFoundError if user does not exist', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      const actor = { role: 'admin' as const };
      await expect(
        usersService.updateUser(
          actor,
          '999e4567-e89b-12d3-a456-426614174999',
          updates
        )
      ).rejects.toThrow(UserNotFoundError);
      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it('should hash password when updating password', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue(mockUser);

      const actor = { role: 'admin' as const };
      await usersService.updateUser(
        actor,
        '123e4567-e89b-12d3-a456-426614174000',
        { password: 'newpassword123' }
      );

      expect(passwordUtils.hashPassword).toHaveBeenCalledWith('newpassword123');
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        {
          password_hash: 'hashed_password',
        }
      );
    });

    it('should check email uniqueness when updating email', async () => {
      const newEmail = 'newemail@example.com';
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.update.mockResolvedValue({ ...mockUser, email: newEmail });

      const actor = { role: 'admin' as const };
      await usersService.updateUser(
        actor,
        '123e4567-e89b-12d3-a456-426614174000',
        { email: newEmail }
      );

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(newEmail);
      expect(mockUserRepo.update).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        { email: newEmail }
      );
    });

    it('should throw DuplicateEmailError if email already exists', async () => {
      const existingUser = {
        ...mockUser,
        user_id: '223e4567-e89b-12d3-a456-426614174002',
      };
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.findByEmail.mockResolvedValue(existingUser);

      const actor = { role: 'admin' as const };
      await expect(
        usersService.updateUser(actor, '123e4567-e89b-12d3-a456-426614174000', {
          email: 'taken@example.com',
        })
      ).rejects.toThrow(DuplicateEmailError);
      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it('should allow same email when not changing it', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue(mockUser);

      const actor = { role: 'admin' as const };
      await usersService.updateUser(
        actor,
        '123e4567-e89b-12d3-a456-426614174000',
        { email: mockUser.email }
      );

      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user successfully', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.delete.mockResolvedValue(true);

      const actor = { role: 'admin' as const };
      const result = await usersService.deleteUser(
        actor,
        '123e4567-e89b-12d3-a456-426614174000'
      );

      expect(mockUserRepo.findById).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000'
      );
      expect(mockUserRepo.delete).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000'
      );
      expect(result.success).toBe(true);
      expect(result.message).toContain('deactivated');
    });

    it('should throw UserNotFoundError if user does not exist', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      const actor = { role: 'admin' as const };
      await expect(
        usersService.deleteUser(actor, '999e4567-e89b-12d3-a456-426614174999')
      ).rejects.toThrow(UserNotFoundError);
      expect(mockUserRepo.delete).not.toHaveBeenCalled();
    });
  });
});
