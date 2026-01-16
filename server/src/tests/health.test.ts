import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';

// Mock supabase for testing
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
