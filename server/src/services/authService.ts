/**
 * Authentication service for user login and credential verification
 */

import { supabaseAdmin } from '../db/supabase.js';
import { comparePassword } from '../utils/password.js';
import { v4 as uuidv4 } from 'uuid';
import {
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshToken,
} from '../utils/crypto.js';
import {
  setRefreshSession,
  getRefreshSession,
  updateRefreshSession,
  deleteRefreshSession,
} from '../db/redis.js';

/**
 * User data returned from the database
 */
interface UserFromDB {
  user_id: string; // UUID
  full_name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'regular';
  active: boolean;
  created_at: string;
}

/**
 * User data returned after successful authentication (without password_hash)
 */
export interface AuthenticatedUser {
  user_id: string; // UUID
  full_name: string;
  email: string;
  role: 'admin' | 'regular';
  active: boolean;
}

/**
 * Custom error classes for authentication failures
 */
export class UserNotFoundError extends Error {
  code = 'USER_NOT_FOUND';
  constructor(message = 'User not found') {
    super(message);
    this.name = 'UserNotFoundError';
  }
}

export class AccountInactiveError extends Error {
  code = 'ACCOUNT_INACTIVE';
  constructor(message = 'Account is inactive') {
    super(message);
    this.name = 'AccountInactiveError';
  }
}

export class InvalidPasswordError extends Error {
  code = 'INVALID_PASSWORD';
  constructor(message = 'Invalid password') {
    super(message);
    this.name = 'InvalidPasswordError';
  }
}

// Keep generic for backward compatibility or catch-all
export class AuthenticationError extends Error {
  code = 'AUTHENTICATION_ERROR';
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class RefreshSessionNotFoundError extends Error {
  code = 'REFRESH_SESSION_NOT_FOUND';
  constructor(message = 'Refresh session not found or expired') {
    super(message);
    this.name = 'RefreshSessionNotFoundError';
  }
}

export class RefreshTokenInvalidError extends Error {
  code = 'REFRESH_TOKEN_INVALID';
  constructor(message = 'Refresh token is invalid') {
    super(message);
    this.name = 'RefreshTokenInvalidError';
  }
}

export class TokenReuseDetectedError extends Error {
  code = 'TOKEN_REUSE_DETECTED';
  constructor(message = 'Token reuse detected - possible theft') {
    super(message);
    this.name = 'TokenReuseDetectedError';
  }
}

/**
 * Authenticate a user by email and password
 * @param email - User's email address
 * @param password - User's plain-text password
 * @returns Authenticated user data (without password hash)
 * @throws UserNotFoundError, AccountInactiveError, InvalidPasswordError
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthenticatedUser> {
  // Query user by email
  const { data: user, error } = await supabaseAdmin
    .from('users')
    .select(
      'user_id, full_name, email, password_hash, role, active, created_at'
    )
    .eq('email', email)
    .single();

  // Handle database errors
  if (error || !user) {
    // Specific error for user not found
    throw new UserNotFoundError();
  }

  // Type assertion since we know the structure from the query
  const userFromDB = user as UserFromDB;

  // Check if user account is active
  if (!userFromDB.active) {
    throw new AccountInactiveError();
  }

  // Verify password
  const passwordMatch = await comparePassword(
    password,
    userFromDB.password_hash
  );

  if (!passwordMatch) {
    throw new InvalidPasswordError();
  }

  // Return user data without password hash
  return {
    user_id: userFromDB.user_id,
    full_name: userFromDB.full_name,
    email: userFromDB.email,
    role: userFromDB.role,
    active: userFromDB.active,
  };
}

/**
 * Create a new refresh token session
 * Generates a refresh token, hashes it, and stores in Redis
 *
 * @param {string} userId - User ID to create session for
 * @param {string} userAgent - Optional user agent string
 * @param {string} ipAddress - Optional IP address
 * @returns {Promise<{sessionId: string, refreshToken: string}>} Session ID and refresh token
 */
export async function createRefreshSession(
  userId: string,
  userAgent?: string,
  ipAddress?: string
): Promise<{ sessionId: string; refreshToken: string }> {
  const sessionId = uuidv4();
  const refreshToken = generateRefreshToken(32); // 32 bytes = 64 hex chars
  const refreshTokenHash = hashRefreshToken(refreshToken);

  await setRefreshSession(sessionId, {
    userId,
    refreshTokenHash,
    createdAt: new Date().toISOString(),
    userAgent,
    ipAddress,
  });

  return { sessionId, refreshToken };
}

/**
 * Validate a refresh token session
 * Checks if session exists and token hash matches
 *
 * @param {string} sessionId - Session ID to validate
 * @param {string} refreshToken - Refresh token to validate
 * @returns {Promise<{userId: string}>} User ID if valid
 * @throws {RefreshSessionNotFoundError} If session doesn't exist
 * @throws {TokenReuseDetectedError} If token hash doesn't match (possible theft)
 */
export async function validateRefreshSession(
  sessionId: string,
  refreshToken: string
): Promise<{ userId: string }> {
  const session = await getRefreshSession(sessionId);

  if (!session) {
    throw new RefreshSessionNotFoundError();
  }

  // Verify token hash
  const isValid = verifyRefreshToken(refreshToken, session.refreshTokenHash);

  if (!isValid) {
    // Token mismatch = possible theft, revoke session immediately
    await deleteRefreshSession(sessionId);
    throw new TokenReuseDetectedError();
  }

  return { userId: session.userId };
}

/**
 * Rotate refresh token (generate new token, update session)
 * Used during token refresh to invalidate old token
 * Includes grace period to prevent rapid rotation during concurrent requests
 *
 * @param {string} sessionId - Session ID to rotate token for
 * @param {number} gracePeriodSeconds - Minimum seconds between rotations (default: 60)
 * @returns {Promise<{refreshToken: string | null, rotated: boolean}>} New refresh token and rotation status
 * @throws {RefreshSessionNotFoundError} If session doesn't exist
 */
export async function rotateRefreshToken(
  sessionId: string,
  gracePeriodSeconds: number = 60
): Promise<{ refreshToken: string | null; rotated: boolean }> {
  // Get current session to check last rotation time
  const session = await getRefreshSession(sessionId);

  if (!session) {
    throw new RefreshSessionNotFoundError();
  }

  // Check if we're within grace period
  const now = new Date().getTime();
  const lastRotated = session.lastRotatedAt
    ? new Date(session.lastRotatedAt).getTime()
    : new Date(session.createdAt).getTime();

  const timeSinceLastRotation = (now - lastRotated) / 1000; // seconds

  // If within grace period, don't rotate - return null to signal no rotation
  if (timeSinceLastRotation < gracePeriodSeconds) {
    return { refreshToken: null, rotated: false };
  }

  // Grace period passed, safe to rotate
  const newRefreshToken = generateRefreshToken(32);
  const newRefreshTokenHash = hashRefreshToken(newRefreshToken);

  const updated = await updateRefreshSession(sessionId, {
    refreshTokenHash: newRefreshTokenHash,
    lastRotatedAt: new Date().toISOString(),
  });

  if (!updated) {
    throw new RefreshSessionNotFoundError();
  }

  return { refreshToken: newRefreshToken, rotated: true };
}

/**
 * Revoke a refresh token session (logout)
 * Deletes session from Redis
 *
 * @param {string} sessionId - Session ID to revoke
 * @returns {Promise<void>}
 */
export async function revokeRefreshSession(sessionId: string): Promise<void> {
  await deleteRefreshSession(sessionId);
}
