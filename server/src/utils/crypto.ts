/**
 * Cryptographic utilities for refresh tokens
 * Handles token generation and hashing
 */

import crypto from 'crypto';

/**
 * Generate a cryptographically secure random token
 *
 * @param {number} bytes - Number of random bytes to generate (default: 32)
 * @returns {string} Hex-encoded random token
 */
export function generateRefreshToken(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Hash a refresh token using SHA-256
 * Tokens are hashed before storing in Redis for security
 *
 * @param {string} token - The refresh token to hash
 * @returns {string} Hex-encoded SHA-256 hash
 */
export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a refresh token against its hash
 *
 * @param {string} token - The refresh token to verify
 * @param {string} hash - The stored hash to compare against
 * @returns {boolean} True if token matches hash
 */
export function verifyRefreshToken(token: string, hash: string): boolean {
  const tokenHash = hashRefreshToken(token);
  // timingSafeEqual requires equal length buffers
  if (tokenHash.length !== hash.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(tokenHash), Buffer.from(hash));
}
