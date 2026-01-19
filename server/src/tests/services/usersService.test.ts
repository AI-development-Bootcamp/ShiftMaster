/**
 * Tests for UsersService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsersService, DuplicateEmailError, UserNotFoundError } from '../../services/usersService.js';
import { UserRepository, User } from '../../db/repositories/UserRepository.stub.js';
import * as passwordUtils from '../../utils/password.js';

// Mock the UserRepository
vi.mock('../../db/repositories/UserRepository.stub.js', () => {
  return {
    UserRepository: vi.fn(() => ({
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findByEmail: vi.fn(),
    })),
  };
});

// Mock password utilities
vi.mock('../../utils/password.js', () => ({
  hashPassword: vi.fn(),
}));

describe('UsersService', () => {
  let usersService: UsersService;
  let mockUserRepo: any;

  const mockUser: User = {
    user_id: 1,
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

    // Create service instance
    usersService = new UsersService();

    // Get mock repository instance
    mockUserRepo = (usersService as any).userRepo;

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
        user_id: 2,
        full_name: newUserData.full_name,
        email: newUserData.email,
        role: newUserData.role,
      });

      const result = await usersService.createUser(newUserData);

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(newUserData.email);
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith(newUserData.password);
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

      await expect(usersService.createUser(newUserData)).rejects.toThrow(
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

      await usersService.createUser(dataWithoutJobTitle);

      expect(mockUserRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          job_title: undefined,
        })
      );
    });
  });

  describe('listUsers', () => {
    const mockUsers: User[] = [
      { ...mockUser, user_id: 1, email: 'user1@example.com' },
      { ...mockUser, user_id: 2, email: 'user2@example.com' },
      { ...mockUser, user_id: 3, email: 'user3@example.com' },
      { ...mockUser, user_id: 4, email: 'user4@example.com' },
      { ...mockUser, user_id: 5, email: 'user5@example.com' },
    ];

    it('should return paginated users with default pagination', async () => {
      mockUserRepo.findAll.mockResolvedValue(mockUsers);

      const result = await usersService.listUsers();

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
      mockUserRepo.findAll.mockResolvedValue(mockUsers);

      const result = await usersService.listUsers(2, 2);

      expect(result.users).toHaveLength(2);
      expect(result.users[0].user_id).toBe(3);
      expect(result.users[1].user_id).toBe(4);
      expect(result.pagination).toEqual({
        total: 5,
        page: 2,
        limit: 2,
        totalPages: 3,
      });
    });

    it('should return empty array for page beyond total', async () => {
      mockUserRepo.findAll.mockResolvedValue(mockUsers);

      const result = await usersService.listUsers(10, 20);

      expect(result.users).toHaveLength(0);
      expect(result.pagination.total).toBe(5);
      expect(result.pagination.page).toBe(10);
    });

    it('should exclude password_hash from all users', async () => {
      mockUserRepo.findAll.mockResolvedValue(mockUsers);

      const result = await usersService.listUsers();

      result.users.forEach((user) => {
        expect(user).not.toHaveProperty('password_hash');
      });
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);

      const result = await usersService.getUserById(1);

      expect(mockUserRepo.findById).toHaveBeenCalledWith(1);
      expect(result).not.toHaveProperty('password_hash');
      expect(result.user_id).toBe(1);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw UserNotFoundError if user does not exist', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(usersService.getUserById(999)).rejects.toThrow(
        UserNotFoundError
      );
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

      const result = await usersService.updateUser(1, updates);

      expect(mockUserRepo.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepo.update).toHaveBeenCalledWith(1, updates);
      expect(result).not.toHaveProperty('password_hash');
      expect(result.full_name).toBe(updates.full_name);
    });

    it('should throw UserNotFoundError if user does not exist', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(usersService.updateUser(999, updates)).rejects.toThrow(
        UserNotFoundError
      );
      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it('should hash password when updating password', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue(mockUser);

      await usersService.updateUser(1, { password: 'newpassword123' });

      expect(passwordUtils.hashPassword).toHaveBeenCalledWith('newpassword123');
      expect(mockUserRepo.update).toHaveBeenCalledWith(1, {
        password_hash: 'hashed_password',
      });
    });

    it('should check email uniqueness when updating email', async () => {
      const newEmail = 'newemail@example.com';
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.update.mockResolvedValue({ ...mockUser, email: newEmail });

      await usersService.updateUser(1, { email: newEmail });

      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith(newEmail);
      expect(mockUserRepo.update).toHaveBeenCalledWith(1, { email: newEmail });
    });

    it('should throw DuplicateEmailError if email already exists', async () => {
      const existingUser = { ...mockUser, user_id: 2 };
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.findByEmail.mockResolvedValue(existingUser);

      await expect(
        usersService.updateUser(1, { email: 'taken@example.com' })
      ).rejects.toThrow(DuplicateEmailError);
      expect(mockUserRepo.update).not.toHaveBeenCalled();
    });

    it('should allow same email when not changing it', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.update.mockResolvedValue(mockUser);

      await usersService.updateUser(1, { email: mockUser.email });

      expect(mockUserRepo.findByEmail).not.toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should soft delete user successfully', async () => {
      mockUserRepo.findById.mockResolvedValue(mockUser);
      mockUserRepo.delete.mockResolvedValue(true);

      const result = await usersService.deleteUser(1);

      expect(mockUserRepo.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepo.delete).toHaveBeenCalledWith(1);
      expect(result.success).toBe(true);
      expect(result.message).toContain('deactivated');
    });

    it('should throw UserNotFoundError if user does not exist', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(usersService.deleteUser(999)).rejects.toThrow(
        UserNotFoundError
      );
      expect(mockUserRepo.delete).not.toHaveBeenCalled();
    });
  });
});
