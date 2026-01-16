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
  return bcrypt.hash(password, SALT_ROUNDS);
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
  return bcrypt.compare(password, hash);
}
