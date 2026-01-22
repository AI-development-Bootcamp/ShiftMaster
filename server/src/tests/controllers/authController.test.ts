/**
 * Unit tests for authentication controller
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// Mock dependencies before importing modules that use them
vi.mock('../../db/supabase.js', () => ({
  supabase: {
    from: vi.fn(),
  },
}));
vi.mock('../../services/authService.js', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../services/authService.js')>();
  return {
    ...actual,
    authenticateUser: vi.fn(),
    createRefreshSession: vi.fn(),
  };
});
vi.mock('../../utils/jwt.js');
vi.mock('../../utils/cookies.js', () => ({
  setRefreshCookies: vi.fn(),
  clearRefreshCookies: vi.fn(),
}));

// Import after mocking
import { login } from '../../controllers/authController.js';
import * as authService from '../../services/authService.js';
import * as jwtUtil from '../../utils/jwt.js';

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  // Helper function to create mock user
  const createMockUser = (overrides = {}) => ({
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    full_name: 'John Doe',
    email: 'john@example.com',
    role: 'regular' as const,
    active: true,
    ...overrides,
  });

  // Helper function to setup successful login mocks
  const setupSuccessfulLoginMocks = (
    user = createMockUser(),
    token = 'mock.jwt.token'
  ) => {
    const mockRefreshToken = 'mock.refresh.token';
    const mockSessionId = 'mock-session-id';

    vi.spyOn(authService, 'authenticateUser').mockResolvedValue(user);
    vi.spyOn(jwtUtil, 'generateToken').mockReturnValue(token);
    vi.spyOn(authService, 'createRefreshSession').mockResolvedValue({
      sessionId: mockSessionId,
      refreshToken: mockRefreshToken,
    });

    return { token, mockRefreshToken, mockSessionId };
  };

  // Helper function to setup request with headers and IP
  const setupRequestWithMetadata = (body: Record<string, unknown>) => {
    mockRequest.body = body;
    mockRequest.headers = { 'user-agent': 'test-agent' };
    mockRequest = {
      ...mockRequest,
      ip: '127.0.0.1',
    };
  };

  // Helper function to expect validation error
  const expectValidationError = (fieldErrors: Record<string, unknown>) => {
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: expect.objectContaining(fieldErrors),
      },
    });
  };

  // Helper function to expect 401 invalid credentials error
  const expectInvalidCredentialsError = () => {
    expect(statusMock).toHaveBeenCalledWith(401);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      },
    });
  };

  // Helper function to expect successful login response
  const expectSuccessfulLogin = (
    token: string,
    user: Record<string, unknown>
  ) => {
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      success: true,
      data: {
        accessToken: token,
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
      },
    });
  };

  beforeEach(() => {
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
    it('should successfully login with valid credentials (client source)', async () => {
      const mockUser = createMockUser();
      const { token } = setupSuccessfulLoginMocks(mockUser);

      setupRequestWithMetadata({
        email: 'john@example.com',
        password: 'SecurePassword123!',
        source: 'client',
      });

      await login(mockRequest as Request, mockResponse as Response);

      // Verify authenticateUser was called correctly
      expect(authService.authenticateUser).toHaveBeenCalledWith(
        'john@example.com',
        'SecurePassword123!'
      );

      // Verify generateToken was called with correct payload
      expect(jwtUtil.generateToken).toHaveBeenCalledWith({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
        role: 'regular',
      });

      expectSuccessfulLogin(token, mockUser);
    });

    it('should successfully login admin user (admin source)', async () => {
      const mockAdmin = createMockUser({
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        full_name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
      });
      const { token } = setupSuccessfulLoginMocks(mockAdmin, 'admin.jwt.token');

      setupRequestWithMetadata({
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        source: 'admin',
      });

      await login(mockRequest as Request, mockResponse as Response);

      expectSuccessfulLogin(token, mockAdmin);
    });

    it('should forbid regular user login from admin source', async () => {
      const mockUser = createMockUser();

      mockRequest.body = {
        email: 'john@example.com',
        password: 'SecurePassword123!',
        source: 'admin',
      };

      vi.spyOn(authService, 'authenticateUser').mockResolvedValue(mockUser);

      await login(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message:
            'Access denied: Regular users cannot access Admin application',
          code: 'ACCESS_DENIED',
        },
      });

      expect(jwtUtil.generateToken).not.toHaveBeenCalled();
    });

    it('should return 400 for missing source', async () => {
      mockRequest.body = {
        email: 'john@example.com',
        password: 'password123',
      };

      await login(mockRequest as Request, mockResponse as Response);

      expectValidationError({
        source: expect.arrayContaining(['Source is required']),
      });
    });

    it('should return 400 for invalid source', async () => {
      mockRequest.body = {
        email: 'john@example.com',
        password: 'password123',
        source: 'unknown',
      };

      await login(mockRequest as Request, mockResponse as Response);

      expectValidationError({
        source: expect.arrayContaining([
          "Invalid enum value. Expected 'admin' | 'client', received 'unknown'",
        ]),
      });
    });

    it('should return 400 for missing email', async () => {
      mockRequest.body = {
        password: 'password123',
        source: 'client',
      };

      await login(mockRequest as Request, mockResponse as Response);

      expectValidationError({
        email: expect.any(Array),
      });

      expect(authService.authenticateUser).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid email format', async () => {
      mockRequest.body = {
        email: 'not-an-email',
        password: 'password123',
        source: 'client',
      };

      await login(mockRequest as Request, mockResponse as Response);

      expectValidationError({
        email: expect.arrayContaining([
          expect.stringContaining('Invalid email format'),
        ]),
      });

      expect(authService.authenticateUser).not.toHaveBeenCalled();
    });

    it('should return 400 for missing password', async () => {
      mockRequest.body = {
        email: 'john@example.com',
        source: 'client',
      };

      await login(mockRequest as Request, mockResponse as Response);

      expectValidationError({
        password: expect.any(Array),
      });

      expect(authService.authenticateUser).not.toHaveBeenCalled();
    });

    it('should return 400 for empty password', async () => {
      mockRequest.body = {
        email: 'john@example.com',
        password: '',
        source: 'client',
      };

      await login(mockRequest as Request, mockResponse as Response);

      expectValidationError({
        password: expect.arrayContaining([
          expect.stringContaining('Password is required'),
        ]),
      });
    });

    it('should return 400 for missing email, password and source', async () => {
      mockRequest.body = {};

      await login(mockRequest as Request, mockResponse as Response);

      expectValidationError({
        email: expect.any(Array),
        password: expect.any(Array),
        source: expect.any(Array),
      });
    });

    it('should return 404 for user not found', async () => {
      mockRequest.body = {
        email: 'nonexistent@example.com',
        password: 'password123',
        source: 'client',
      };

      const error = new authService.UserNotFoundError();
      vi.spyOn(authService, 'authenticateUser').mockRejectedValue(error);

      await login(mockRequest as Request, mockResponse as Response);

      expectInvalidCredentialsError();
    });

    it('should return 401 for inactive account', async () => {
      mockRequest.body = {
        email: 'inactive@example.com',
        password: 'password123',
        source: 'client',
      };

      const error = new authService.AccountInactiveError();
      vi.spyOn(authService, 'authenticateUser').mockRejectedValue(error);

      await login(mockRequest as Request, mockResponse as Response);

      expectInvalidCredentialsError();
    });

    it('should return 401 for invalid password', async () => {
      mockRequest.body = {
        email: 'john@example.com',
        password: 'WrongPassword',
        source: 'client',
      };

      const error = new authService.InvalidPasswordError();
      vi.spyOn(authService, 'authenticateUser').mockRejectedValue(error);

      await login(mockRequest as Request, mockResponse as Response);

      expectInvalidCredentialsError();
    });

    it('should return 500 for unexpected errors', async () => {
      mockRequest.body = {
        email: 'john@example.com',
        password: 'password123',
        source: 'client',
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
      const mockUser = createMockUser();
      setupSuccessfulLoginMocks(mockUser);

      setupRequestWithMetadata({
        email: 'john@example.com',
        password: 'SecurePassword123!',
        source: 'client',
      });

      await login(mockRequest as Request, mockResponse as Response);

      const responseData = jsonMock.mock.calls[0][0];
      expect(responseData.data.user).not.toHaveProperty('password');
      expect(responseData.data.user).not.toHaveProperty('password_hash');
    });

    it('should not include active flag in response', async () => {
      const mockUser = createMockUser();
      setupSuccessfulLoginMocks(mockUser);

      setupRequestWithMetadata({
        email: 'john@example.com',
        password: 'SecurePassword123!',
        source: 'client',
      });

      await login(mockRequest as Request, mockResponse as Response);

      const responseData = jsonMock.mock.calls[0][0];
      expect(responseData.data.user).not.toHaveProperty('active');
    });
  });
});
