/**
 * Integration tests for protected routes with authentication middleware
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import express, { Request, Response } from 'express';

// Mock the env config before importing modules that use it
import { vi } from 'vitest';
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

// Create test app with protected routes
const app = express();
app.use(express.json());

// Test route that requires authentication
app.get('/protected', isAuthenticated, (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'This is a protected resource',
      user: res.req.user,
    },
  });
});

// Test route that requires admin role
app.get(
  '/admin-only',
  isAuthenticated,
  isAdmin,
  (_req: Request, res: Response) => {
    res.json({
      success: true,
      data: {
        message: 'This is an admin-only resource',
      },
    });
  }
);

// Test route with only admin check (should return 401 if not authenticated)
app.get('/admin-direct', isAdmin, (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'This should not be reached without authentication',
    },
  });
});

describe('Protected Routes Integration Tests', () => {
  describe('GET /protected - isAuthenticated middleware', () => {
    it('should allow access with valid JWT token', async () => {
      const token = generateToken({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
        role: 'regular',
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('This is a protected resource');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.userId).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(response.body.data.user.email).toBe('john@example.com');
      expect(response.body.data.user.role).toBe('regular');
    });

    it('should deny access without Authorization header', async () => {
      const response = await request(app).get('/protected');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should deny access with malformed Authorization header', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'InvalidFormat token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should deny access with expired token', async () => {
      const expiredToken = generateToken(
        {
          userId: '550e8400-e29b-41d4-a716-446655440000',
          email: 'john@example.com',
          role: 'regular',
        },
        '0s'
      );

      // Wait to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should allow access for admin users', async () => {
      const adminToken = generateToken({
        userId: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@example.com',
        role: 'admin',
      });

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('admin');
    });
  });

  describe('GET /admin-only - isAdmin middleware', () => {
    it('should allow access for admin users', async () => {
      const adminToken = generateToken({
        userId: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@example.com',
        role: 'admin',
      });

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('This is an admin-only resource');
    });

    it('should deny access for regular users', async () => {
      const regularToken = generateToken({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'john@example.com',
        role: 'regular',
      });

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
      expect(response.body.error.message).toContain('Admin access required');
    });

    it('should deny access without authentication', async () => {
      const response = await request(app).get('/admin-only');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('GET /admin-direct - isAdmin without isAuthenticated', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const response = await request(app).get('/admin-direct');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should allow access for authenticated admin', async () => {
      const adminToken = generateToken({
        userId: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@example.com',
        role: 'admin',
      });

      // Note: This won't work properly without isAuthenticated first
      // because req.user won't be set. This tests that isAdmin checks for req.user
      const response = await request(app)
        .get('/admin-direct')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Middleware chaining', () => {
    it('should properly chain isAuthenticated and isAdmin for admin user', async () => {
      const adminToken = generateToken({
        userId: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@example.com',
        role: 'admin',
      });

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should properly reject regular user at isAdmin middleware', async () => {
      const regularToken = generateToken({
        userId: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        role: 'regular',
      });

      const response = await request(app)
        .get('/admin-only')
        .set('Authorization', `Bearer ${regularToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    it('should properly reject unauthenticated user at isAuthenticated middleware', async () => {
      const response = await request(app).get('/admin-only');

      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });
});
