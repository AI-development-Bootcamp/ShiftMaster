/**
 * TEMPORARY STUB for UserRepository
 * 
 * TODO: Replace with actual UserRepository after repository branch merge
 * 
 * This stub matches the interface described in dbKnowledge.md:
 * - BaseRepository methods: create, findById, findAll, update, delete (soft delete)
 * - UserRepository specific: findByEmail
 */

import { supabase } from '../supabase.js';
import { v4 as uuidv4 } from 'uuid';

// Type definitions matching database schema
export interface User {
  user_id: string; // UUID
  full_name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'regular';
  job_title: string | null;
  active: boolean;
  created_at: string;
}

export interface NewUser {
  full_name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'regular';
  job_title?: string;
  active?: boolean;
}

export interface UpdateUser {
  full_name?: string;
  email?: string;
  password_hash?: string;
  role?: 'admin' | 'regular';
  job_title?: string;
  active?: boolean;
}

/**
 * Temporary stub implementation of UserRepository
 * Extends BaseRepository<User, NewUser, UpdateUser>
 */
export class UserRepository {
  private tableName = 'users';

  /**
   * Creates a new user record
   */
  async create(data: NewUser): Promise<User> {
    const userData = {
      user_id: uuidv4(), // Generate UUID
      ...data,
      active: data.active ?? true,
    };

    const { data: user, error } = await supabase
      .from(this.tableName)
      .insert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return user;
  }

  /**
   * Finds a user by ID
   */
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return data;
  }

  /**
   * Retrieves all users
   */
  async findAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Updates a user by ID
   */
  async update(id: string, updates: UpdateUser): Promise<User> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('user_id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return data;
  }

  /**
   * Soft deletes a user (sets active=false)
   * Supports soft delete for users table
   */
  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from(this.tableName)
      .update({ active: false })
      .eq('user_id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    return true;
  }

  /**
   * UserRepository specific method: Finds a user by email address
   */
  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new Error(`Failed to find user by email: ${error.message}`);
    }

    return data;
  }
}
