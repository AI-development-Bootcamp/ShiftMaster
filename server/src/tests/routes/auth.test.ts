/**
 * Integration tests for authentication routes
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
vi.mock('../../services/authService.js');
vi.mock('../../utils/jwt.js');

import authRouter from '../../routes/auth.js';
import * as authService from '../../services/authService.js';
import * as jwtUtil from '../../utils/jwt.js';

// Create test app
const app = express();
app.use(express.json());
app.use('/auth', authRouter);

describe('POST /auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 200 with token and user data on successful login', async () => {
    const mockUser = {
      user_id: 1,
      full_name: 'John Doe',
      email: 'john@example.com',
      role: 'regular' as const,
      active: true,
    };

    const mockToken = 'mock.jwt.token';

    vi.spyOn(authService, 'authenticateUser').mockResolvedValue(mockUser);
    vi.spyOn(jwtUtil, 'generateToken').mockReturnValue(mockToken);

    const response = await request(app).post('/auth/login').send({
      email: 'john@example.com',
      password: 'SecurePassword123!',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        token: mockToken,
        user: {
          user_id: 1,
          full_name: 'John Doe',
          email: 'john@example.com',
          role: 'regular',
        },
      },
    });
  });

  it('should return 400 for missing email', async () => {
    const response = await request(app).post('/auth/login').send({
      password: 'password123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details).toHaveProperty('email');
  });

  it('should return 400 for invalid email format', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'not-an-email',
      password: 'password123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.email).toContain('Invalid email format');
  });

  it('should return 400 for missing password', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'john@example.com',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details).toHaveProperty('password');
  });

  it('should return 401 for invalid credentials', async () => {
    vi.spyOn(authService, 'authenticateUser').mockRejectedValue(
      new authService.AuthenticationError('Invalid credentials')
    );

    const response = await request(app).post('/auth/login').send({
      email: 'john@example.com',
      password: 'WrongPassword',
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: {
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      },
    });
  });

  it('should return 500 for server errors', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    vi.spyOn(authService, 'authenticateUser').mockRejectedValue(
      new Error('Database connection failed')
    );

    const response = await request(app).post('/auth/login').send({
      email: 'john@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });

    consoleErrorSpy.mockRestore();
  });

  it('should have correct Content-Type header', async () => {
    const mockUser = {
      user_id: 1,
      full_name: 'John Doe',
      email: 'john@example.com',
      role: 'regular' as const,
      active: true,
    };

    vi.spyOn(authService, 'authenticateUser').mockResolvedValue(mockUser);
    vi.spyOn(jwtUtil, 'generateToken').mockReturnValue('token');

    const response = await request(app).post('/auth/login').send({
      email: 'john@example.com',
      password: 'password123',
    });

    expect(response.headers['content-type']).toMatch(/application\/json/);
  });

  it('should accept JSON body', async () => {
    const mockUser = {
      user_id: 1,
      full_name: 'John Doe',
      email: 'john@example.com',
      role: 'regular' as const,
      active: true,
    };

    vi.spyOn(authService, 'authenticateUser').mockResolvedValue(mockUser);
    vi.spyOn(jwtUtil, 'generateToken').mockReturnValue('token');

    const response = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send(
        JSON.stringify({
          email: 'john@example.com',
          password: 'password123',
        })
      );

    expect(response.status).toBe(200);
    expect(authService.authenticateUser).toHaveBeenCalledWith(
      'john@example.com',
      'password123'
    );
  });
});
