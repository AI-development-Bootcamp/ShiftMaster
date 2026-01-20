/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    env: {
      SUPABASE_URL: 'https://mock.supabase.co',
      SUPABASE_ANON_KEY: 'mock-key-anon',
      SUPABASE_SECRET_KEY: 'mock-key-secret'
    }
  },
});
