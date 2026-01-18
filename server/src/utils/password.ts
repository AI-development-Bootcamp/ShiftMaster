/**
 * Password hashing and comparison utilities using bcrypt
 */

import bcrypt from 'bcrypt';

/**
 * Number of salt rounds for bcrypt hashing
 * Higher values = more secure but slower
 * 10 is a good balance for most applications
 */
const SALT_ROUNDS = 10;

/**
 * Hash a plain-text password using bcrypt
 * @param password - Plain-text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    const err = new Error('Failed to hash password') as Error & { code?: string; cause?: unknown };
    err.code = 'E_HASH_PASSWORD';
    err.cause = error;
    throw err;
  }
}

/**
 * Compare a plain-text password with a bcrypt hash
 * @param password - Plain-text password to check
 * @param hash - Bcrypt hash to compare against
 * @returns True if password matches hash, false otherwise
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    const err = new Error('Failed to compare password') as Error & { code?: string; cause?: unknown };
    err.code = 'E_COMPARE_PASSWORD';
    err.cause = error;
    throw err;
  }
}
