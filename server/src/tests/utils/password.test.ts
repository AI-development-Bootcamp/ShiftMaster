/**
 * Unit tests for password utility functions
 */

import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../../utils/password.js';

describe('Password Utilities', () => {
  const testPassword = 'SecurePassword123!';
  const wrongPassword = 'WrongPassword456!';

  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const hash = await hashPassword(testPassword);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(testPassword); // Hash should not equal plain text
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for the same password', async () => {
      // bcrypt uses a random salt, so same password produces different hashes
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);

      expect(hash1).not.toBe(hash2);
    });

    it('should generate bcrypt-format hash', async () => {
      const hash = await hashPassword(testPassword);

      // bcrypt hashes start with $2b$ or $2a$ and have specific format
      expect(hash).toMatch(/^\$2[ab]\$/);
    });

    it('should handle empty string password', async () => {
      const hash = await hashPassword('');

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should handle long passwords', async () => {
      const longPassword = 'a'.repeat(100);
      const hash = await hashPassword(longPassword);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });

    it('should handle special characters in password', async () => {
      const specialCharsPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
      const hash = await hashPassword(specialCharsPassword);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
    });
  });

  describe('comparePassword', () => {
    it('should return true for matching password and hash', async () => {
      const hash = await hashPassword(testPassword);
      const result = await comparePassword(testPassword, hash);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password and hash', async () => {
      const hash = await hashPassword(testPassword);
      const result = await comparePassword(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it('should handle empty string comparisons', async () => {
      const hash = await hashPassword('');
      const result = await comparePassword('', hash);

      expect(result).toBe(true);
    });

    it('should return false when comparing empty string with non-empty hash', async () => {
      const hash = await hashPassword(testPassword);
      const result = await comparePassword('', hash);

      expect(result).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'Password123';
      const hash = await hashPassword(password);

      const lowerCaseResult = await comparePassword('password123', hash);
      const upperCaseResult = await comparePassword('PASSWORD123', hash);

      expect(lowerCaseResult).toBe(false);
      expect(upperCaseResult).toBe(false);
    });

    it('should handle special characters correctly', async () => {
      const specialPassword = '!@#Test$%^&*Password()';
      const hash = await hashPassword(specialPassword);
      const result = await comparePassword(specialPassword, hash);

      expect(result).toBe(true);
    });

    it('should return false for slightly different passwords', async () => {
      const password = 'password123';
      const hash = await hashPassword(password);

      // Test similar but different passwords
      expect(await comparePassword('password124', hash)).toBe(false);
      expect(await comparePassword('password12', hash)).toBe(false);
      expect(await comparePassword('password 123', hash)).toBe(false);
    });
  });

  describe('hash and compare integration', () => {
    it('should correctly hash and verify multiple different passwords', async () => {
      const passwords = [
        'short',
        'VeryLongPasswordWithManyCharacters123456789!@#$',
        '12345',
        'pass word with spaces',
        '!@#$%^&*()',
      ];

      for (const password of passwords) {
        const hash = await hashPassword(password);
        const isMatch = await comparePassword(password, hash);
        expect(isMatch).toBe(true);
      }
    });

    it('should handle rapid successive hash operations', async () => {
      // Test that multiple rapid operations work correctly
      const promises = Array.from({ length: 5 }, (_, i) =>
        hashPassword(`password${i}`)
      );

      const hashes = await Promise.all(promises);

      expect(hashes).toHaveLength(5);
      hashes.forEach((hash) => {
        expect(hash).toBeDefined();
        expect(typeof hash).toBe('string');
      });

      // All hashes should be unique
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(5);
    });
  });
});
