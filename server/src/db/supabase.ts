import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables: SUPABASE_URL and SUPABASE_ANON_KEY are required'
  );
}

export const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey);
