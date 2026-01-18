/**
 * Unit tests for JWT utility functions
 */

import { describe, it, expect, vi } from 'vitest';
import type { JwtPayload } from '../../utils/jwt.js';

// Mock the env config to control JWT_SECRET
const TEST_JWT_SECRET =
  'test-secret-key-for-jwt-testing-at-least-256-bits-long-string-here';

vi.mock('../../config/index.js', () => ({
  env: {
    jwtSecret: TEST_JWT_SECRET,
    jwtExpiry: '24h',
  },
}));

// Import after mocking
const { generateToken, verifyToken } = await import('../../utils/jwt.js');

describe('JWT Utilities', () => {
  const mockPayload: JwtPayload = {
    userId: 1,
    email: 'test@example.com',
    role: 'regular',
  };

  describe('generateToken', () => {
    it('should generate a valid JWT token with default 24h expiry', () => {
      const token = generateToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });

    it('should generate token with custom expiry', () => {
      const token = generateToken(mockPayload, '1h');

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should include all payload fields in the token', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should include iat and exp claims', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);

      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('verifyToken', () => {
    it('should successfully verify and decode a valid token', () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should throw error for expired token', () => {
      // Generate token that expires immediately
      const token = generateToken(mockPayload, '0s');

      // Wait a moment to ensure expiration
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(() => verifyToken(token)).toThrow('Token expired');
          resolve(undefined);
        }, 100);
      });
    });

    it('should throw error for invalid token signature', () => {
      const token = generateToken(mockPayload);
      // Tamper with the token by modifying the signature
      const tamperedToken = token.slice(0, -10) + 'tampered123';

      expect(() => verifyToken(tamperedToken)).toThrow('Invalid token');
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'not.a.valid.jwt.token';

      expect(() => verifyToken(malformedToken)).toThrow('Invalid token');
    });

    it('should throw error for empty token', () => {
      expect(() => verifyToken('')).toThrow('Invalid token');
    });
  });

  describe('token payload integrity', () => {
    it('should maintain payload integrity through generation and verification', () => {
      const payload: JwtPayload = {
        userId: 12345,
        email: 'admin@example.com',
        role: 'admin',
      };

      const token = generateToken(payload);
      const decoded = verifyToken(token);

      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.email).toBe(payload.email);
      expect(decoded.role).toBe(payload.role);
    });

    it('should handle different user roles correctly', () => {
      const regularUser = generateToken({
        userId: 1,
        email: 'user@example.com',
        role: 'regular',
      });
      const adminUser = generateToken({
        userId: 2,
        email: 'admin@example.com',
        role: 'admin',
      });

      const decodedRegular = verifyToken(regularUser);
      const decodedAdmin = verifyToken(adminUser);

      expect(decodedRegular.role).toBe('regular');
      expect(decodedAdmin.role).toBe('admin');
    });
  });
});
