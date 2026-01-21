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
  AuthorizationError,
  type Actor,
} from '../services/usersService.js';
import { supabaseAdmin } from '../db/supabase.js';

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
    const actor: Actor = {
      role: req.user!.role,
    };

    // Use admin client for admin operations
    const usersService = new UsersService(supabaseAdmin);
    const user = await usersService.createUser(
      actor,
      validationResult.data as {
        full_name: string;
        email: string;
        password: string;
        role: 'admin' | 'regular';
        job_title?: string;
      }
    );

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

    // Handle authorization error
    if (error instanceof AuthorizationError) {
      res.status(403).json({
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

    const { page, limit, active, search } = validationResult.data;

    // Get users list
    const actor: Actor = { role: req.user!.role };
    const usersService = new UsersService(supabaseAdmin);
    const result = await usersService.listUsers(actor, page, limit, {
      active,
      search,
    });

    // Return success response
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Handle authorization error
    if (error instanceof AuthorizationError) {
      res.status(403).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      });
      return;
    }

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
export async function getCurrentUser(
  req: Request,
  res: Response
): Promise<void> {
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

    // Get user (admin client for bypassing RLS)
    const usersService = new UsersService(supabaseAdmin);
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

    // Get user (admin client for bypassing RLS)
    const usersService = new UsersService(supabaseAdmin);
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
    const actor: Actor = { role: req.user!.role };
    const usersService = new UsersService(supabaseAdmin);
    const user = await usersService.updateUser(
      actor,
      userId,
      bodyValidation.data as {
        full_name?: string;
        email?: string;
        password?: string;
        role?: 'admin' | 'regular';
        job_title?: string;
        active?: boolean;
      }
    );

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

    // Handle authorization error
    if (error instanceof AuthorizationError) {
      res.status(403).json({
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
    const actor: Actor = { role: req.user!.role };
    const usersService = new UsersService(supabaseAdmin);
    const result = await usersService.deleteUser(actor, userId);

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

    // Handle authorization error
    if (error instanceof AuthorizationError) {
      res.status(403).json({
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
