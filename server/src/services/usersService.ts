/**
 * User management service
 * Business logic for user CRUD operations
 */

import { UserRepository, User, NewUser, UpdateUser } from '../db/repositories/UserRepository.stub.js';
import { hashPassword } from '../utils/password.js';

/**
 * User data without password_hash (for responses)
 */
export interface UserResponse {
  user_id: string; // UUID
  full_name: string;
  email: string;
  role: 'admin' | 'regular';
  job_title: string | null;
  active: boolean;
  created_at: string;
}

/**
 * Paginated users response
 */
export interface PaginatedUsersResponse {
  users: UserResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Error thrown when email already exists
 */
export class DuplicateEmailError extends Error {
  code = 'DUPLICATE_EMAIL';
  constructor(email: string) {
    super(`User with email ${email} already exists`);
    this.name = 'DuplicateEmailError';
  }
}

/**
 * Error thrown when user is not found
 */
export class UserNotFoundError extends Error {
  code = 'USER_NOT_FOUND';
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}

/**
 * Remove password_hash from user object
 */
function sanitizeUser(user: User): UserResponse {
  const { password_hash: _password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

/**
 * UsersService class
 * Handles all user management business logic
 */
export class UsersService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  /**
   * Create a new user
   * @throws DuplicateEmailError if email already exists
   */
  async createUser(userData: {
    full_name: string;
    email: string;
    password: string;
    role: 'admin' | 'regular';
    job_title?: string;
  }): Promise<UserResponse> {
    // Check email uniqueness
    const existingUser = await this.userRepo.findByEmail(userData.email);
    if (existingUser) {
      throw new DuplicateEmailError(userData.email);
    }

    // Hash password
    const password_hash = await hashPassword(userData.password);

    // Create user with hashed password
    const newUser: NewUser = {
      full_name: userData.full_name,
      email: userData.email,
      password_hash,
      role: userData.role,
      job_title: userData.job_title,
      active: true,
    };

    const createdUser = await this.userRepo.create(newUser);

    return sanitizeUser(createdUser);
  }

  /**
   * Get paginated list of users
   */
  async listUsers(page: number = 1, limit: number = 20): Promise<PaginatedUsersResponse> {
    // Get all users
    const allUsers = await this.userRepo.findAll();

    // Calculate pagination
    const total = allUsers.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // Slice for current page
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    // Sanitize users (remove password_hash)
    const users = paginatedUsers.map(sanitizeUser);

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Get a single user by ID
   * @throws UserNotFoundError if user doesn't exist
   */
  async getUserById(userId: string): Promise<UserResponse> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    return sanitizeUser(user);
  }

  /**
   * Update a user
   * @throws UserNotFoundError if user doesn't exist
   * @throws DuplicateEmailError if email already exists (when updating email)
   */
  async updateUser(
    userId: string,
    updates: {
      full_name?: string;
      email?: string;
      password?: string;
      role?: 'admin' | 'regular';
      job_title?: string;
      active?: boolean;
    }
  ): Promise<UserResponse> {
    // Verify user exists
    const existingUser = await this.userRepo.findById(userId);
    if (!existingUser) {
      throw new UserNotFoundError(userId);
    }

    // If updating email, check uniqueness
    if (updates.email && updates.email !== existingUser.email) {
      const userWithEmail = await this.userRepo.findByEmail(updates.email);
      if (userWithEmail) {
        throw new DuplicateEmailError(updates.email);
      }
    }

    // Prepare update data
    const updateData: UpdateUser = {};

    // Copy fields from updates, handling password specially
    if (updates.full_name !== undefined) updateData.full_name = updates.full_name;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.role !== undefined) updateData.role = updates.role;
    if (updates.job_title !== undefined) updateData.job_title = updates.job_title;
    if (updates.active !== undefined) updateData.active = updates.active;

    // If updating password, hash it first
    if (updates.password) {
      updateData.password_hash = await hashPassword(updates.password);
    }

    // Update user
    const updatedUser = await this.userRepo.update(userId, updateData);

    return sanitizeUser(updatedUser);
  }

  /**
   * Soft delete a user (set active=false)
   * @throws UserNotFoundError if user doesn't exist
   */
  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    // Verify user exists
    const existingUser = await this.userRepo.findById(userId);
    if (!existingUser) {
      throw new UserNotFoundError(userId);
    }

    // Soft delete
    await this.userRepo.delete(userId);

    return {
      success: true,
      message: `User ${userId} has been deactivated`,
    };
  }
}
