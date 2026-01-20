/**
 * Authentication service for user login and credential verification
 */

import { supabaseAdmin } from '../db/supabase.js';
import { comparePassword } from '../utils/password.js';

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
 * Custom error class for authentication failures
 */
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authenticate a user by email and password
 * @param email - User's email address
 * @param password - User's plain-text password
 * @returns Authenticated user data (without password hash)
 * @throws AuthenticationError if authentication fails
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
  if (error) {
    // User not found (or other database error)
    throw new AuthenticationError('Invalid credentials');
  }

  // Type assertion since we know the structure from the query
  const userFromDB = user as UserFromDB;

  // Check if user account is active
  if (!userFromDB.active) {
    throw new AuthenticationError('Invalid credentials');
  }

  // Verify password
  const passwordMatch = await comparePassword(
    password,
    userFromDB.password_hash
  );

  if (!passwordMatch) {
    throw new AuthenticationError('Invalid credentials');
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
