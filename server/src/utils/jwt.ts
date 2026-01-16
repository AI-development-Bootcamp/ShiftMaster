/**
 * JWT utility functions for token generation and verification
 */

import jwt from 'jsonwebtoken';
import { env } from '../config/index.js';

export interface JwtPayload {
  userId: number;
  email: string;
  role: 'admin' | 'regular';
}

export interface DecodedToken extends JwtPayload {
  iat: number;
  exp: number;
}

/**
 * Generate a JWT token for a user
 * @param payload - User data to encode in the token
 * @param expiresIn - Token expiration time (default: from env.jwtExpiry, fallback to 24h)
 * @returns Signed JWT token
 */
export function generateToken(
  payload: JwtPayload,
  expiresIn: string = env.jwtExpiry
): string {
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(payload, env.jwtSecret, { expiresIn } as jwt.SignOptions);
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): DecodedToken {
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as DecodedToken;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}
