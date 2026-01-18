import { vi } from 'vitest';

// Mock environment variables
process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_ANON_KEY = 'mock-key';
process.env.SUPABASE_SECRET_KEY = 'mock-secret';

// Mock Supabase client globally if needed, but per-test mocking is often safer.
// However, since `supabase.ts` instantiates the client immediately at top-level,
// we need valid env vars BEFORE imports happen.
