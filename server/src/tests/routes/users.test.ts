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
}));

// Create mock service methods  
const mockCreateUser = vi.fn();
const mockListUsers = vi.fn();
const mockGetUserById = vi.fn();
const mockUpdateUser = vi.fn();
const mockDeleteUser = vi.fn();

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

// Mock JWT utilities
vi.mock('../../utils/jwt.js', () => ({
  verifyToken: vi.fn(),
  generateToken: vi.fn(),
}));

import usersRouter from '../../routes/users.js';
import {
  DuplicateEmailError,
  UserNotFoundError,
  __mocks,
} from '../../services/usersService.js';
import * as jwtUtil from '../../utils/jwt.js';

const {
  mockCreateUser: serviceCreateUser,
  mockListUsers: serviceListUsers,
  mockGetUserById: serviceGetUserById,
  mockUpdateUser: serviceUpdateUser,
  mockDeleteUser: serviceDeleteUser,
} = __mocks;

// Create test app
const app = express();
app.use(express.json());
app.use('/users', usersRouter);

// Test constants
const VALID_ADMIN_TOKEN = 'valid.admin.token';
const VALID_USER_TOKEN = 'valid.user.token';
const INVALID_TOKEN = 'invalid.token';

const mockAdminUser = {
  userId: 1,
  email: 'admin@example.com',
  role: 'admin' as const,
};

const mockRegularUser = {
  userId: 2,
  email: 'user@example.com',
  role: 'regular' as const,
};

describe('Users Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /users', () => {
    it('should create user when authenticated as admin', async () => {
      const mockUser = {
        user_id: 3,
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
        .post('/users')
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`)
        .send({
          full_name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
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
        .post('/users')
        .send({
          full_name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          role: 'regular',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 when authenticated as regular user', async () => {
      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockRegularUser);

      const response = await request(app)
        .post('/users')
        .set('Authorization', `Bearer ${VALID_USER_TOKEN}`)
        .send({
          full_name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
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
        .post('/users')
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`)
        .send({
          full_name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          role: 'regular',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('DUPLICATE_EMAIL');
    });

    it('should return 400 for validation errors', async () => {
      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);

      const response = await request(app)
        .post('/users')
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

      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceListUsers.mockResolvedValue(mockResult);

      const response = await request(app)
        .get('/users')
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
        .get('/users?page=2&limit=10')
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`);

      expect(response.status).toBe(200);
      expect(serviceListUsers).toHaveBeenCalledWith(2, 10);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/users');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 when authenticated as regular user', async () => {
      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockRegularUser);

      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${VALID_USER_TOKEN}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by ID when admin', async () => {
      const mockUser = {
        user_id: 1,
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
        .get('/users/1')
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
      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceGetUserById.mockRejectedValue(new UserNotFoundError(999));

      const response = await request(app)
        .get('/users/999')
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).get('/users/1');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('PATCH /users/:id', () => {
    it('should update user when admin', async () => {
      const mockUser = {
        user_id: 1,
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
        .patch('/users/1')
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
      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceUpdateUser.mockRejectedValue(new UserNotFoundError(999));

      const response = await request(app)
        .patch('/users/999')
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
        .patch('/users/1')
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`)
        .send({
          email: 'taken@example.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('DUPLICATE_EMAIL');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .patch('/users/1')
        .send({
          full_name: 'Updated Name',
        });

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user when admin', async () => {
      const mockResult = {
        success: true,
        message: 'User 1 has been deactivated',
      };

      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceDeleteUser.mockResolvedValue(mockResult);

      const response = await request(app)
        .delete('/users/1')
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        data: mockResult,
      });
    });

    it('should return 404 when user not found', async () => {
      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
      serviceDeleteUser.mockRejectedValue(new UserNotFoundError(999));

      const response = await request(app)
        .delete('/users/999')
        .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app).delete('/users/1');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 when authenticated as regular user', async () => {
      vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockRegularUser);

      const response = await request(app)
        .delete('/users/1')
        .set('Authorization', `Bearer ${VALID_USER_TOKEN}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });
  });
});
