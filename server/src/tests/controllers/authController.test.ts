/**
 * Unit tests for authentication controller
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// Mock env config first
vi.mock('../../config/index.js', () => ({
  env: {
    jwtSecret: 'test-secret-key-for-jwt-testing',
    jwtExpiry: '24h',
    supabaseUrl: 'https://test.supabase.co',
    supabaseAnonKey: 'test-anon-key',
  },
}));

// Mock dependencies before importing modules that use them
vi.mock('../../db/supabase.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}));
vi.mock('../../services/authService.js');
vi.mock('../../utils/jwt.js');

// Import after mocking
import { login } from '../../controllers/authController.js';
import * as authService from '../../services/authService.js';
import * as jwtUtil from '../../utils/jwt.js';

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    mockRequest = {
      body: {},
    };

    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        user_id: 1,
        full_name: 'John Doe',
        email: 'john@example.com',
        role: 'regular' as const,
        active: true,
      };

      const mockToken = 'mock.jwt.token';

      mockRequest.body = {
        email: 'john@example.com',
        password: 'SecurePassword123!',
      };

      vi.spyOn(authService, 'authenticateUser').mockResolvedValue(mockUser);
      vi.spyOn(jwtUtil, 'generateToken').mockReturnValue(mockToken);

      await login(mockRequest as Request, mockResponse as Response);

      // Verify authenticateUser was called correctly
      expect(authService.authenticateUser).toHaveBeenCalledWith(
        'john@example.com',
        'SecurePassword123!'
      );

      // Verify generateToken was called with correct payload
      expect(jwtUtil.generateToken).toHaveBeenCalledWith({
        userId: 1,
        email: 'john@example.com',
        role: 'regular',
      });

      // Verify response
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
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

    it('should successfully login admin user', async () => {
      const mockAdmin = {
        user_id: 2,
        full_name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin' as const,
        active: true,
      };

      const mockToken = 'admin.jwt.token';

      mockRequest.body = {
        email: 'admin@example.com',
        password: 'AdminPassword123!',
      };

      vi.spyOn(authService, 'authenticateUser').mockResolvedValue(mockAdmin);
      vi.spyOn(jwtUtil, 'generateToken').mockReturnValue(mockToken);

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          token: mockToken,
          user: {
            user_id: 2,
            full_name: 'Admin User',
            email: 'admin@example.com',
            role: 'admin',
          },
        },
      });
    });

    it('should return 400 for missing email', async () => {
      mockRequest.body = {
        password: 'password123',
      };

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: expect.objectContaining({
            email: expect.any(Array),
          }),
        },
      });

      expect(authService.authenticateUser).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid email format', async () => {
      mockRequest.body = {
        email: 'not-an-email',
        password: 'password123',
      };

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: expect.objectContaining({
            email: expect.arrayContaining([
              expect.stringContaining('Invalid email format'),
            ]),
          }),
        },
      });

      expect(authService.authenticateUser).not.toHaveBeenCalled();
    });

    it('should return 400 for missing password', async () => {
      mockRequest.body = {
        email: 'john@example.com',
      };

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: expect.objectContaining({
            password: expect.any(Array),
          }),
        },
      });

      expect(authService.authenticateUser).not.toHaveBeenCalled();
    });

    it('should return 400 for empty password', async () => {
      mockRequest.body = {
        email: 'john@example.com',
        password: '',
      };

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: expect.objectContaining({
            password: expect.arrayContaining([
              expect.stringContaining('Password is required'),
            ]),
          }),
        },
      });
    });

    it('should return 400 for both missing email and password', async () => {
      mockRequest.body = {};

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: expect.objectContaining({
            email: expect.any(Array),
            password: expect.any(Array),
          }),
        },
      });
    });

    it('should return 401 for invalid credentials', async () => {
      mockRequest.body = {
        email: 'john@example.com',
        password: 'WrongPassword',
      };

      vi.spyOn(authService, 'authenticateUser').mockRejectedValue(
        new authService.AuthenticationError('Invalid credentials')
      );

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        },
      });
    });

    it('should return 500 for unexpected errors', async () => {
      mockRequest.body = {
        email: 'john@example.com',
        password: 'password123',
      };

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      vi.spyOn(authService, 'authenticateUser').mockRejectedValue(
        new Error('Database connection failed')
      );

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        },
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it('should not include password in response', async () => {
      const mockUser = {
        user_id: 1,
        full_name: 'John Doe',
        email: 'john@example.com',
        role: 'regular' as const,
        active: true,
      };

      mockRequest.body = {
        email: 'john@example.com',
        password: 'SecurePassword123!',
      };

      vi.spyOn(authService, 'authenticateUser').mockResolvedValue(mockUser);
      vi.spyOn(jwtUtil, 'generateToken').mockReturnValue('token');

      await login(mockRequest as Request, mockResponse as Response);

      const responseData = jsonMock.mock.calls[0][0];
      expect(responseData.data.user).not.toHaveProperty('password');
      expect(responseData.data.user).not.toHaveProperty('password_hash');
    });

    it('should not include active flag in response', async () => {
      const mockUser = {
        user_id: 1,
        full_name: 'John Doe',
        email: 'john@example.com',
        role: 'regular' as const,
        active: true,
      };

      mockRequest.body = {
        email: 'john@example.com',
        password: 'SecurePassword123!',
      };

      vi.spyOn(authService, 'authenticateUser').mockResolvedValue(mockUser);
      vi.spyOn(jwtUtil, 'generateToken').mockReturnValue('token');

      await login(mockRequest as Request, mockResponse as Response);

      const responseData = jsonMock.mock.calls[0][0];
      expect(responseData.data.user).not.toHaveProperty('active');
    });
  });
});
