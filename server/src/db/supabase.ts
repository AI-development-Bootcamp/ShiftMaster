import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY are required'
  );
}

if (!env.supabaseSecretKey) {
  throw new Error(
    'Missing Supabase service role key: SUPABASE_SECRET_KEY is required for admin operations'
  );
}

/**
 * Regular Supabase client for standard operations
 * Uses anon key with RLS policies enforced
 */
export const supabase: SupabaseClient = createClient(
  env.supabaseUrl,
  env.supabaseAnonKey
);

/**
 * Admin Supabase client for migrations, seed data, and admin operations
 * Uses service role key to bypass RLS policies
 * WARNING: Only use this for trusted backend operations
 */
export const supabaseAdmin: SupabaseClient = createClient(
  env.supabaseUrl,
  env.supabaseSecretKey
);
