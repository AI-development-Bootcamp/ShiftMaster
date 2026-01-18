import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

/**
 * Supabase client instance
 *
 * Environment variables are validated at server startup via validateEnv().
 * In test environment, uses stub values automatically.
 */
export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
