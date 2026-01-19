import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

/**
 * Supabase client instances
 *
 * Environment variables are validated at server startup via validateEnv().
 * In test environment, uses stub values automatically.
 */

// For testing environments, allow partial configuration to avoid import-time crashes
// The tests will mock the usage of these clients anyway.
const isTest = process.env.NODE_ENV === 'test';

// Use env object which properly extracts the Supabase API URL
// Fallbacks for test environment to ensure createClient doesn't crash
const url = env.supabaseUrl || (isTest ? 'https://mock.supabase.co' : '');
const key = env.supabaseAnonKey || (isTest ? 'mock-anon-key' : '');
const secret = env.supabaseSecretKey || (isTest ? 'mock-secret-key' : '');

/**
 * Regular Supabase client for standard operations
 * Uses anon key with RLS policies enforced
 */
export const supabase: SupabaseClient = createClient(url, key);

/**
 * Admin Supabase client for migrations, seed data, and admin operations
 * Uses service role key to bypass RLS policies
 * WARNING: Only use this for trusted backend operations
 */
export const supabaseAdmin: SupabaseClient = createClient(url, secret);
