/**
 * Users controller for handling user management requests
 */

import { Request, Response } from 'express';
import {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  listUsersSchema,
} from '../validations/userValidation.js';
import {
  UsersService,
  DuplicateEmailError,
  UserNotFoundError,
} from '../services/usersService.js';

// Initialize service
const usersService = new UsersService();

/**
 * Handle POST /api/v1/users - Create new user
 * @admin_only
 */
export async function createUser(req: Request, res: Response): Promise<void> {
  try {
    // Validate request body
    const validationResult = createUserSchema.safeParse(req.body);

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

    // Create user
    const user = await usersService.createUser(validationResult.data);

    // Return success response
    res.status(201).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    // Handle duplicate email error
    if (error instanceof DuplicateEmailError) {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
      return;
    }

    // Handle unexpected errors
    console.error('Create user error:', error);
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
 * Handle GET /api/v1/users - List users with pagination
 * @admin_only
 */
export async function listUsers(req: Request, res: Response): Promise<void> {
  try {
    // Validate query parameters
    const validationResult = listUsersSchema.safeParse(req.query);

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

    const { page, limit } = validationResult.data;

    // Get users list
    const result = await usersService.listUsers(page, limit);

    // Return success response
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Handle unexpected errors
    console.error('List users error:', error);
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
 * Handle GET /api/v1/users/me - Get current user's information
 * @authenticated
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    // Get user ID from JWT token (set by isAuthenticated middleware)
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: {
          message: 'User ID not found in token',
          code: 'UNAUTHORIZED',
        },
      });
      return;
    }

    // Get user
    const user = await usersService.getUserById(userId);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    // Handle user not found error
    if (error instanceof UserNotFoundError) {
      res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
      return;
    }

    // Handle unexpected errors
    console.error('Get current user error:', error);
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
 * Handle GET /api/v1/users/:id - Get single user
 * @admin_only
 */
export async function getUser(req: Request, res: Response): Promise<void> {
  try {
    // Validate user ID parameter
    const validationResult = getUserSchema.safeParse({ id: req.params.id });

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

    const userId = validationResult.data.id; // UUID string

    // Get user
    const user = await usersService.getUserById(userId);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    // Handle user not found error
    if (error instanceof UserNotFoundError) {
      res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
      return;
    }

    // Handle unexpected errors
    console.error('Get user error:', error);
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
 * Handle PATCH /api/v1/users/:id - Update user
 * @admin_only
 */
export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    // Validate user ID parameter
    const paramValidation = getUserSchema.safeParse({ id: req.params.id });

    if (!paramValidation.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: paramValidation.error.flatten().fieldErrors,
        },
      });
      return;
    }

    // Validate request body
    const bodyValidation = updateUserSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: bodyValidation.error.flatten().fieldErrors,
        },
      });
      return;
    }

    const userId = paramValidation.data.id; // UUID string

    // Update user
    const user = await usersService.updateUser(userId, bodyValidation.data);

    // Return success response
    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    // Handle user not found error
    if (error instanceof UserNotFoundError) {
      res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
      return;
    }

    // Handle duplicate email error
    if (error instanceof DuplicateEmailError) {
      res.status(400).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
      return;
    }

    // Handle unexpected errors
    console.error('Update user error:', error);
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
 * Handle DELETE /api/v1/users/:id - Soft delete user
 * @admin_only
 */
export async function deleteUser(req: Request, res: Response): Promise<void> {
  try {
    // Validate user ID parameter
    const validationResult = getUserSchema.safeParse({ id: req.params.id });

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

    const userId = validationResult.data.id; // UUID string

    // Delete user
    const result = await usersService.deleteUser(userId);

    // Return success response
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Handle user not found error
    if (error instanceof UserNotFoundError) {
      res.status(404).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
      return;
    }

    // Handle unexpected errors
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
}
