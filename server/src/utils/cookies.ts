/**
 * Cookie utilities for refresh token management
 * Handles setting and clearing HttpOnly secure cookies
 */

import { Response } from 'express';
// import { env } from '../config/env.js';

/**
 * Cookie configuration options
 */
interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  maxAge: number;
  path: string;
  domain?: string;
}

/**
 * Get cookie options based on environment
 * Secure flag is disabled in development for http://localhost
 *
 * @param {number} maxAge - Cookie max age in milliseconds
 * @returns {CookieOptions} Cookie configuration
 */
function getCookieOptions(maxAge: number): CookieOptions {
  // const isProduction = env.nodeEnv === 'production';

  const options: CookieOptions = {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: true, // Only send over HTTPS in production
    sameSite: 'none', // 'none' required for cross-domain in production
    maxAge, // Cookie expiration in milliseconds
    path: '/', // Must be '/' to work across domains
  };

  // In development, don't set domain so cookies work across localhost ports
  // In production, don't set domain to use the default (current domain)
  // This allows cookies to be shared between frontend and backend on different ports

  return options;
}

/**
 * Set refresh token cookies
 * Sets both refreshToken (the actual token) and refreshSessionId (session identifier)
 *
 * @param {Response} res - Express response object
 * @param {string} refreshToken - The refresh token value
 * @param {string} sessionId - The session ID
 */
export function setRefreshCookies(
  res: Response,
  refreshToken: string,
  sessionId: string
): void {
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  const options = getCookieOptions(maxAge);

  // Set refresh token cookie (HttpOnly)
  res.cookie('refreshToken', refreshToken, options);

  // Set session ID cookie (HttpOnly)
  res.cookie('refreshSessionId', sessionId, options);
}

/**
 * Clear refresh token cookies
 * Used during logout to remove all refresh cookies
 *
 * @param {Response} res - Express response object
 */
export function clearRefreshCookies(res: Response): void {
  const options = getCookieOptions(0); // maxAge 0 = immediate expiration

  res.clearCookie('refreshToken', options);
  res.clearCookie('refreshSessionId', options);
}
