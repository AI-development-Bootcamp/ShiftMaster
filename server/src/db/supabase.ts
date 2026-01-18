import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

/**
 * Supabase client instance
 *
 * Environment variables are validated at server startup via validateEnv().
 * In test environment, uses stub values automatically.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
// For testing environments, allow partial configuration to avoid import-time crashes
// The tests will mock the usage of these clients anyway.
const isTest = process.env.NODE_ENV === 'test';

if ((!env.supabaseUrl || !env.supabaseAnonKey) && !isTest) {
  throw new Error(
    'Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY are required'
  );
}

if (!env.supabaseSecretKey && !isTest) {
  throw new Error(
    'Missing Supabase service role key: SUPABASE_SECRET_KEY is required for admin operations'
  );
}

// Fallbacks for test environment to ensure createClient doesn't crash
const url = env.supabaseUrl || 'https://mock.supabase.co';
const key = env.supabaseAnonKey || 'mock-key';
const secret = env.supabaseSecretKey || 'mock-secret';

/**
 * Regular Supabase client for standard operations
 * Uses anon key with RLS policies enforced
 */
export const supabase: SupabaseClient = createClient(
  url,
  key
);

/**
 * Admin Supabase client for migrations, seed data, and admin operations
 * Uses service role key to bypass RLS policies
 * WARNING: Only use this for trusted backend operations
 */
export const supabaseAdmin: SupabaseClient = createClient(
  url,
  secret
);
