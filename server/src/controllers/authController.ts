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

    const { email, password } = validationResult.data;

    // Authenticate user
    const user = await authenticateUser(email, password);

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
    // Handle authentication errors
    if (error instanceof AuthenticationError) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        },
      });
      return;
    }

    // Handle unexpected errors
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}
