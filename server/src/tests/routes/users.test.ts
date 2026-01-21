/**
 * Integration tests for users routes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock dependencies
vi.mock('../../db/supabase.js', () => ({
  supabase: {
    from: vi.fn(),
  },
  supabaseAdmin: {
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
      constructor(userId: string) {
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

// Mock JWT utilities
vi.mock('../../utils/jwt.js', () => ({
  verifyToken: vi.fn(),
  generateToken: vi.fn(),
}));

import usersRouter from '../../routes/users.js';
import { DuplicateEmailError, UserNotFoundError } from '../../services/usersService.js';
import * as jwtUtil from '../../utils/jwt.js';

// Get mocks from the mocked module
const usersServiceModule = await vi.importMock<typeof import('../../services/usersService.js')>('../../services/usersService.js');
const {
  mockCreateUser: serviceCreateUser,
  mockListUsers: serviceListUsers,
  mockGetUserById: serviceGetUserById,
  mockUpdateUser: serviceUpdateUser,
  mockDeleteUser: serviceDeleteUser,
} = (usersServiceModule as unknown as { __mocks: Record<string, ReturnType<typeof vi.fn>> }).__mocks;

// Create test app
const app = express();
app.use(express.json());
app.use('/api/v1/users', usersRouter);

// Test constants
const VALID_ADMIN_TOKEN = 'valid.admin.token';
const VALID_USER_TOKEN = 'valid.user.token';

const mockAdminUser = {
  userId: '550e8400-e29b-41d4-a716-446655440000',
  email: 'admin@example.com',
  role: 'admin' as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
};

const mockRegularUser = {
  userId: '550e8400-e29b-41d4-a716-446655440001',
  email: 'user@example.com',
  role: 'regular' as const,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
};

describe('Users Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /users', () => {
    it('should create user when authenticated as admin', async () => {
      const mockUser = {
        user_id: '550e8400-e29b-41d4-a716-446655440002',
        full_name: 'New User',
        email: 'newuser@example.com',
        role: 'regular' as const,
        job_title: 'Engineer',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceCreateUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`)
        .send({
          full_name: 'New User',
          email: 'newuser@example.com',
          password: 'Password123!',
          role: 'regular',
          job_title: 'Engineer',
        });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        data: {
          user: mockUser,
        },
      });
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .post('/api/v1/users')
        .send({
          full_name: 'New User',
          email: 'newuser@example.com',
          password: 'Password123!',
          role: 'regular',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 when authenticated as regular user', async () => {
      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockRegularUser);

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${VALID_USER_TOKEN}`)
        .send({
          full_name: 'New User',
          email: 'newuser@example.com',
          password: 'Password123!',
          role: 'regular',
        });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 for duplicate email', async () => {
      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceCreateUser.mockRejectedValue(
        new DuplicateEmailError('newuser@example.com')
      );

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`)
        .send({
          full_name: 'New User',
          email: 'newuser@example.com',
          password: 'Password123!',
          role: 'regular',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('DUPLICATE_EMAIL');
    });

    it('should return 400 for validation errors', async () => {
      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);

      const response = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`)
        .send({
          full_name: 'New User',
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /users', () => {
    it('should list users with default pagination when admin', async () => {
      const mockResult = {
        users: [
          {
            user_id: '550e8400-e29b-41d4-a716-446655440003',
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

      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceListUsers.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
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

      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceListUsers.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/api/v1/users?page=2&limit=10')
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`);

      expect(response.status).toBe(200);
      expect(serviceListUsers).toHaveBeenCalledWith({ role: 'admin' }, 2, 10, {
        active: undefined,
        search: undefined,
      });
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/v1/users');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 when authenticated as regular user', async () => {
      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockRegularUser);

      const response = await request(app)
        .get('/api/v1/users')
        .set('Authorization', `Bearer ${VALID_USER_TOKEN}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('GET /users/me', () => {
    it('should get current user info when authenticated', async () => {
      const mockUser = {
        user_id: mockRegularUser.userId,
        full_name: 'Current User',
        email: mockRegularUser.email,
        role: 'regular' as const,
        job_title: 'Engineer',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockRegularUser);
      serviceGetUserById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${VALID_USER_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          user: mockUser,
        },
      });
      expect(serviceGetUserById).toHaveBeenCalledWith(mockRegularUser.userId);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/api/v1/users/me');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should work for admin users too', async () => {
      const mockUser = {
        user_id: mockAdminUser.userId,
        full_name: 'Admin User',
        email: mockAdminUser.email,
        role: 'admin' as const,
        job_title: 'Administrator',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceGetUserById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body.data.user.role).toBe('admin');
    });
  });

  describe('GET /users/:id', () => {
    const testUserId = '550e8400-e29b-41d4-a716-446655440004';

    it('should get user by ID when admin', async () => {
      const mockUser = {
        user_id: testUserId,
        full_name: 'John Doe',
        email: 'john@example.com',
        role: 'regular' as const,
        job_title: 'Engineer',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceGetUserById.mockResolvedValue(mockUser);

      const response = await request(app)
        .get(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          user: mockUser,
        },
      });
    });

    it('should return 404 when user not found', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceGetUserById.mockRejectedValue(new UserNotFoundError(nonExistentId));

      const response = await request(app)
        .get(`/api/v1/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get(`/api/v1/users/${testUserId}`);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PATCH /users/:id', () => {
    const testUserId = '550e8400-e29b-41d4-a716-446655440005';

    it('should update user when admin', async () => {
      const mockUser = {
        user_id: testUserId,
        full_name: 'Updated Name',
        email: 'john@example.com',
        role: 'regular' as const,
        job_title: 'Senior Engineer',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceUpdateUser.mockResolvedValue(mockUser);

      const response = await request(app)
        .patch(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`)
        .send({
          full_name: 'Updated Name',
          job_title: 'Senior Engineer',
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: {
          user: mockUser,
        },
      });
    });

    it('should return 404 when user not found', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceUpdateUser.mockRejectedValue(new UserNotFoundError(nonExistentId));

      const response = await request(app)
        .patch(`/api/v1/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`)
        .send({
          full_name: 'Updated Name',
        });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });

    it('should return 400 for duplicate email', async () => {
      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceUpdateUser.mockRejectedValue(
        new DuplicateEmailError('taken@example.com')
      );

      const response = await request(app)
        .patch(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`)
        .send({
          email: 'taken@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('DUPLICATE_EMAIL');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .patch(`/api/v1/users/${testUserId}`)
        .send({
          full_name: 'Updated Name',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('DELETE /users/:id', () => {
    const testUserId = '550e8400-e29b-41d4-a716-446655440006';

    it('should delete user when admin', async () => {
      const mockResult = {
        success: true,
        message: `User ${testUserId} has been deactivated`,
      };

      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceDeleteUser.mockResolvedValue(mockResult);

      const response = await request(app)
        .delete(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockResult,
      });
    });

    it('should return 404 when user not found', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceDeleteUser.mockRejectedValue(new UserNotFoundError(nonExistentId));

      const response = await request(app)
        .delete(`/api/v1/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).delete(`/api/v1/users/${testUserId}`);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 when authenticated as regular user', async () => {
      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockRegularUser);

      const response = await request(app)
        .delete(`/api/v1/users/${testUserId}`)
        .set('Authorization', `Bearer ${VALID_USER_TOKEN}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });
});
