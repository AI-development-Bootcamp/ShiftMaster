/**
 * Unit tests for users controller
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// Mock dependencies before importing
vi.mock('../../db/supabase.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock the UsersService class
vi.mock('../../services/usersService.js', () => {
  const mockCreateUser = vi.fn();
  const mockListUsers = vi.fn();
  const mockGetUserById = vi.fn();
  const mockUpdateUser = vi.fn();
  const mockDeleteUser = vi.fn();

  return {
    UsersService: vi.fn().mockImplementation(() => ({
      createUser: mockCreateUser,
      listUsers: mockListUsers,
      getUserById: mockGetUserById,
      updateUser: mockUpdateUser,
      deleteUser: mockDeleteUser,
    })),
    DuplicateEmailError: class DuplicateEmailError extends Error {
      code = 'DUPLICATE_EMAIL';
      constructor(email: string) {
        super(`User with email ${email} already exists`);
      }
    },
    UserNotFoundError: class UserNotFoundError extends Error {
      code = 'USER_NOT_FOUND';
      constructor(userId: number) {
        super(`User with ID ${userId} not found`);
      }
    },
    // Export mocks for testing
    __mocks: {
      mockCreateUser,
      mockListUsers,
      mockGetUserById,
      mockUpdateUser,
      mockDeleteUser,
    },
  };
});

// Import after mocking
import {
  createUser,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
} from '../../controllers/usersController.js';
import {
  DuplicateEmailError,
  UserNotFoundError,
  __mocks,
} from '../../services/usersService.js';

const {
  mockCreateUser,
  mockListUsers,
  mockGetUserById,
  mockUpdateUser,
  mockDeleteUser,
} = __mocks;

describe('UsersController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const mockUser = {
        user_id: 1,
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        role: 'admin' as const,
        job_title: 'Manager',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
      };

      mockRequest.body = {
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'admin',
        job_title: 'Manager',
      };

      mockCreateUser.mockResolvedValue(mockUser);

      await createUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUser,
        },
      });
    });

    it('should return 400 for validation errors', async () => {
      mockRequest.body = {
        full_name: 'Jane Doe',
        // Missing required fields
      };

      await createUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
          }),
        })
      );
    });

    it('should return 400 for duplicate email', async () => {
      mockRequest.body = {
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'admin',
      };

      const duplicateError = new DuplicateEmailError('jane@example.com');
      mockCreateUser.mockRejectedValue(duplicateError);

      await createUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: duplicateError.message,
          code: 'DUPLICATE_EMAIL',
        },
      });
    });

    it('should return 500 for unexpected errors', async () => {
      mockRequest.body = {
        full_name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'admin',
      };

      mockCreateUser.mockRejectedValue(new Error('Unexpected error'));

      await createUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        },
      });
    });
  });

  describe('listUsers', () => {
    it('should list users with default pagination', async () => {
      const mockResult = {
        users: [
          {
            user_id: 1,
            full_name: 'User 1',
            email: 'user1@example.com',
            role: 'regular' as const,
            job_title: null,
            active: true,
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          total: 1,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      };

      mockRequest.query = {};
      mockListUsers.mockResolvedValue(mockResult);

      await listUsers(mockRequest as Request, mockResponse as Response);

      expect(mockListUsers).toHaveBeenCalledWith(1, 20);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });

    it('should list users with custom pagination', async () => {
      const mockResult = {
        users: [],
        pagination: {
          total: 0,
          page: 2,
          limit: 10,
          totalPages: 0,
        },
      };

      mockRequest.query = { page: '2', limit: '10' };
      mockListUsers.mockResolvedValue(mockResult);

      await listUsers(mockRequest as Request, mockResponse as Response);

      expect(mockListUsers).toHaveBeenCalledWith(2, 10);
      expect(statusMock).toHaveBeenCalledWith(200);
    });

    it('should return 400 for invalid pagination parameters', async () => {
      mockRequest.query = { page: 'invalid' };

      await listUsers(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
          }),
        })
      );
    });
  });

  describe('getUser', () => {
    it('should get user by ID successfully', async () => {
      const mockUser = {
        user_id: 1,
        full_name: 'John Doe',
        email: 'john@example.com',
        role: 'regular' as const,
        job_title: 'Engineer',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
      };

      mockRequest.params = { id: '1' };
      mockGetUserById.mockResolvedValue(mockUser);

      await getUser(mockRequest as Request, mockResponse as Response);

      expect(mockGetUserById).toHaveBeenCalledWith(1);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUser,
        },
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: '999' };

      const notFoundError = new UserNotFoundError(999);
      mockGetUserById.mockRejectedValue(notFoundError);

      await getUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: notFoundError.message,
          code: 'USER_NOT_FOUND',
        },
      });
    });

    it('should return 400 for invalid user ID', async () => {
      mockRequest.params = { id: 'invalid' };

      await getUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
          }),
        })
      );
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const mockUser = {
        user_id: 1,
        full_name: 'Updated Name',
        email: 'john@example.com',
        role: 'regular' as const,
        job_title: 'Senior Engineer',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        full_name: 'Updated Name',
        job_title: 'Senior Engineer',
      };

      mockUpdateUser.mockResolvedValue(mockUser);

      await updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockUpdateUser).toHaveBeenCalledWith(1, {
        full_name: 'Updated Name',
        job_title: 'Senior Engineer',
      });
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          user: mockUser,
        },
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { full_name: 'Updated Name' };

      const notFoundError = new UserNotFoundError(999);
      mockUpdateUser.mockRejectedValue(notFoundError);

      await updateUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: notFoundError.message,
          code: 'USER_NOT_FOUND',
        },
      });
    });

    it('should return 400 for duplicate email', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { email: 'taken@example.com' };

      const duplicateError = new DuplicateEmailError('taken@example.com');
      mockUpdateUser.mockRejectedValue(duplicateError);

      await updateUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: duplicateError.message,
          code: 'DUPLICATE_EMAIL',
        },
      });
    });

    it('should return 400 for validation errors', async () => {
      mockRequest.params = { id: 'invalid' };
      mockRequest.body = { full_name: 'Updated Name' };

      await updateUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
          }),
        })
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockResult = {
        success: true,
        message: 'User 1 has been deactivated',
      };

      mockRequest.params = { id: '1' };
      mockDeleteUser.mockResolvedValue(mockResult);

      await deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockDeleteUser).toHaveBeenCalledWith(1);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });

    it('should return 404 if user not found', async () => {
      mockRequest.params = { id: '999' };

      const notFoundError = new UserNotFoundError(999);
      mockDeleteUser.mockRejectedValue(notFoundError);

      await deleteUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: notFoundError.message,
          code: 'USER_NOT_FOUND',
        },
      });
    });

    it('should return 400 for invalid user ID', async () => {
      mockRequest.params = { id: 'invalid' };

      await deleteUser(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
          }),
        })
      );
    });
  });
});
