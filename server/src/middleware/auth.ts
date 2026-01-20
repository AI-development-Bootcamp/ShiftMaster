/**
 * Authentication and authorization middleware
 */

import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import type { DecodedToken } from '../utils/jwt.js';

// Extend Express Request type to include user data using module augmentation
declare module 'express-serve-static-core' {
  interface Request {
    user?: DecodedToken;
  }
}

/**
 * Middleware to verify JWT token and authenticate user
 * Attaches decoded user data to req.user if token is valid
 * Returns 401 if token is missing, invalid, or expired
 */
export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    // Check if it follows "Bearer <token>" format
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        success: false,
        error: {
          message: 'Unauthorized',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    const token = parts[1];

    // Verify token
    const decoded = verifyToken(token);

    // Attach user data to request
    req.user = decoded;

    next();
  } catch (error) {
    // Token verification failed (expired, invalid, etc.)
    res.status(401).json({
      success: false,
      error: {
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
      },
    });
  }
}

/**
 * Middleware to check if authenticated user has admin role
 * Must be used after isAuthenticated middleware
 * Returns 403 if user is not admin
 * Returns 401 if user is not authenticated
 */
export function isAdmin(req: Request, res: Response, next: NextFunction): void {
  // Check if user is authenticated
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        message: 'Unauthorized',
        code: 'UNAUTHORIZED',
      },
    });
    return;
  }

  // Check if user has admin role
  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: {
        message: 'Forbidden: Admin access required',
        code: 'FORBIDDEN',
      },
    });
    return;
  }

  next();
}
