/**
 * Authentication controller for handling login requests
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import {
  authenticateUser,
  AuthenticationError,
  createRefreshSession,
  validateRefreshSession,
  rotateRefreshToken,
  revokeRefreshSession,
} from '../services/authService.js';
import { generateToken } from '../utils/jwt.js';
import { setRefreshCookies, clearRefreshCookies } from '../utils/cookies.js';

/**
 * Validation schema for login request
 */
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
  source: z.enum(['admin', 'client'], {
    required_error: 'Source is required',
    invalid_type_error: "Source must be either 'admin' or 'client'",
  }),
});

/**
 * Handle POST /login request
 * Validates credentials, generates JWT token, and returns user data
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: validationResult.error.flatten().fieldErrors,
        },
      });
      return;
    }

    const { email, password, source } = validationResult.data;

    // Authenticate user
    const user = await authenticateUser(email, password);

    // Role Enforcement: Check source against user role
    // Only admins can login to admin source
    // Regular users logging into admin source is forbidden
    if (source === 'admin' && user.role !== 'admin') {
      res.status(403).json({
        success: false,
        error: {
          message: 'Access denied: Regular users cannot access Admin application',
          code: 'ACCESS_DENIED',
        },
      });
      return;
    }

    // Generate access token (JWT with 15min expiry)
    const accessToken = generateToken({
      userId: user.user_id,
      email: user.email,
      role: user.role,
    });

    // Create refresh token session in Redis
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip || req.socket.remoteAddress;
    const { sessionId, refreshToken } = await createRefreshSession(
      user.user_id,
      userAgent,
      ipAddress
    );

    // Set HttpOnly cookies for refresh token and session ID
    setRefreshCookies(res, refreshToken, sessionId);

    // Return success response with access token and user data
    res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    // Handle specific authentication errors
    const errorResponse = (status: number, message: string, code: string) => {
      res.status(status).json({
        success: false,
        error: { message, code },
      });
    };

    const err = error as Error;

    if (err instanceof AuthenticationError || err.name === 'AuthenticationError') {
      return errorResponse(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Check error names directly as classes might be imported from modified file
    if (
      err.name === 'UserNotFoundError' ||
      err.name === 'AccountInactiveError' ||
      err.name === 'InvalidPasswordError'
    ) {
      return errorResponse(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    // Handle unexpected errors
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}

/**
 * Handle POST /refresh request
 * Validates refresh token, rotates it, and returns new access token
 */
export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    // Read cookies
    const refreshToken = req.cookies.refreshToken;
    const sessionId = req.cookies.refreshSessionId;

    // Validate cookies present
    if (!refreshToken || !sessionId) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Refresh token missing',
          code: 'REFRESH_TOKEN_MISSING',
        },
      });
      return;
    }

    // Validate refresh session and token
    const { userId } = await validateRefreshSession(sessionId, refreshToken);

    // Rotate refresh token (invalidate old one, generate new one)
    // Grace period prevents rapid rotation during concurrent requests
    const { refreshToken: newRefreshToken, rotated } =
      await rotateRefreshToken(sessionId);

    // Only update cookies if rotation occurred
    if (rotated && newRefreshToken) {
      setRefreshCookies(res, newRefreshToken, sessionId);
    }

    // Get user data from database to include in new access token
    const { supabaseAdmin } = await import('../db/supabase.js');
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('user_id, email, role')
      .eq('user_id', userId)
      .single();

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND',
        },
      });
      return;
    }

    // Generate new access token
    const accessToken = generateToken({
      userId: user.user_id,
      email: user.email,
      role: user.role,
    });

    // Return new access token
    res.status(200).json({
      success: true,
      data: {
        accessToken,
      },
    });
  } catch (error) {
    const err = error as Error;

    // Handle refresh token errors
    if (err.name === 'RefreshSessionNotFoundError') {
      res.status(401).json({
        success: false,
        error: {
          message: 'Refresh session not found or expired',
          code: 'REFRESH_SESSION_NOT_FOUND',
        },
      });
      return;
    }

    if (err.name === 'TokenReuseDetectedError') {
      res.status(401).json({
        success: false,
        error: {
          message: 'Token reuse detected - session revoked',
          code: 'TOKEN_REUSE_DETECTED',
        },
      });
      return;
    }

    // Handle unexpected errors
    console.error('Refresh error:', err);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}

/**
 * Handle POST /logout request
 * Revokes refresh session and clears cookies
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const sessionId = req.cookies.refreshSessionId;

    // If session ID exists, revoke it
    if (sessionId) {
      await revokeRefreshSession(sessionId);
    }

    // Clear refresh cookies
    clearRefreshCookies(res);

    // Return success
    res.status(204).send();
  } catch (error) {
    // Even if revocation fails, clear cookies and return success
    // This ensures user can always logout from frontend
    console.error('Logout error:', error);
    clearRefreshCookies(res);
    res.status(204).send();
  }
}
