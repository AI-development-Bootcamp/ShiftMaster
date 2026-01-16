import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Mock env to prevent import errors
vi.mock('../config/env.js', () => ({
  env: {
    jwtSecret: 'test-secret',
    jwtExpiry: '24h',
    supabaseUrl: 'https://test.supabase.co',
    supabaseAnonKey: 'test-key',
    corsOrigins: ['http://localhost:3000'],
    port: 3000,
  },
}));

vi.mock('../db/supabase.js', () => ({
  supabase: { from: vi.fn() },
}));

import app from '../app.js';

describe('Server Health Check', () => {
  it('should return 200 OK - server is alive', async () => {
    const response = await request(app).get('/api/v1/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
