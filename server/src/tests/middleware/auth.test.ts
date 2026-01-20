/**
 * Unit tests for authentication and authorization middleware
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from '../../utils/jwt.js';

// Mock the env config before importing modules that use it
vi.mock('../../config/index.js', () => ({
  env: {
    jwtSecret:
      'test-secret-key-for-jwt-testing-at-least-256-bits-long-string-here',
    jwtExpiry: '24h',
  },
}));

// Import after mocking
import { isAuthenticated, isAdmin } from '../../middleware/auth.js';
import { generateToken } from '../../utils/jwt.js';

describe('Authentication Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks before each test
    mockRequest = {
      headers: {},
    };

    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    nextFunction = vi.fn();
  });

  describe('isAuthenticated', () => {
    it('should authenticate user with valid token', () => {
      const payload: JwtPayload = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        role: 'regular',
      };
      const token = generateToken(payload);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      isAuthenticated(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.userId).toBe(payload.userId);
      expect(mockRequest.user?.email).toBe(payload.email);
      expect(mockRequest.user?.role).toBe(payload.role);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 401 when Authorization header is missing', () => {
      mockRequest.headers = {};

      isAuthenticated(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });

    it('should return 401 when token is malformed (no Bearer prefix)', () => {
      const token = generateToken({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        role: 'regular',
      });

      mockRequest.headers = {
        authorization: token, // Missing "Bearer " prefix
      };

      isAuthenticated(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid.token.here',
      };

      isAuthenticated(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });

    it('should return 401 when token is expired', async () => {
      // Generate token that expires immediately
      const token = generateToken(
        {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          email: 'test@example.com',
          role: 'regular',
        },
        '0s'
      );

      // Wait to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      isAuthenticated(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });

    it('should return 401 when Authorization header has wrong format', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      isAuthenticated(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should handle admin user tokens', () => {
      const payload: JwtPayload = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@example.com',
        role: 'admin',
      };
      const token = generateToken(payload);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      isAuthenticated(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockRequest.user?.role).toBe('admin');
      expect(statusMock).not.toHaveBeenCalled();
    });
  });

  describe('isAdmin', () => {
    it('should allow access for admin user', () => {
      mockRequest.user = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@example.com',
        role: 'admin',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      isAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 403 for regular user', () => {
      mockRequest.user = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        role: 'regular',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      };

      isAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Forbidden: Admin access required',
          code: 'FORBIDDEN',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when no user is authenticated', () => {
      mockRequest.user = undefined;

      isAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 when req.user is null', () => {
      mockRequest.user = undefined;

      isAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('middleware chaining', () => {
    it('should work correctly when isAuthenticated is followed by isAdmin for admin user', () => {
      const payload: JwtPayload = {
        userId: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@example.com',
        role: 'admin',
      };
      const token = generateToken(payload);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      // First middleware: isAuthenticated
      isAuthenticated(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledTimes(1);
      expect(mockRequest.user).toBeDefined();

      // Reset next mock
      nextFunction = vi.fn();

      // Second middleware: isAdmin
      isAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalledTimes(1);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should block regular user when isAdmin is called after isAuthenticated', () => {
      const payload: JwtPayload = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        role: 'regular',
      };
      const token = generateToken(payload);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      // First middleware: isAuthenticated
      isAuthenticated(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalledTimes(1);
      expect(mockRequest.user).toBeDefined();

      // Reset mocks
      nextFunction = vi.fn();
      jsonMock = vi.fn();
      statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      mockResponse.status = statusMock;

      // Second middleware: isAdmin
      isAdmin(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });
});
