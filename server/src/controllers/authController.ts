/**
 * Authentication controller for handling login requests
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import {
  authenticateUser,
  AuthenticationError,
} from '../services/authService.js';
import { generateToken } from '../utils/jwt.js';

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

    // Generate JWT token
    const token = generateToken({
      userId: user.user_id,
      email: user.email,
      role: user.role,
    });

    // Return success response with token and user data
    res.status(200).json({
      success: true,
      data: {
        token,
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
    if (err.name === 'UserNotFoundError') {
      return errorResponse(404, 'User not found', 'USER_NOT_FOUND');
    }

    if (err.name === 'AccountInactiveError') {
      return errorResponse(401, 'Account is inactive', 'ACCOUNT_INACTIVE');
    }

    if (err.name === 'InvalidPasswordError') {
      return errorResponse(401, 'Invalid password', 'INVALID_PASSWORD'); // Or keep INVALID_CREDENTIALS if strict security preferred
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
