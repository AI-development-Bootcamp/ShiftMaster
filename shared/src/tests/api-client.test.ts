/**
 * Tests for ApiClient refresh token retry and storm prevention
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios, { AxiosRequestConfig } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { ApiClient, TokenHooks } from '../api/client';

describe('ApiClient', () => {
  let mockAxios: MockAdapter;
  let tokenHooks: TokenHooks;
  let onUnauthorized: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock axios
    mockAxios = new MockAdapter(axios);

    // Create mock token hooks
    let token: string | null = null;
    tokenHooks = {
      getAccessToken: vi.fn(() => token),
      setAccessToken: vi.fn((newToken: string) => {
        token = newToken;
      }),
      clearAccessToken: vi.fn(() => {
        token = null;
      }),
    };

    // Create mock unauthorized callback
    onUnauthorized = vi.fn();
  });

  afterEach(() => {
    mockAxios.reset();
    vi.clearAllMocks();
  });

  describe('Refresh token retry on 401', () => {
    it('should retry request after refreshing token on 401', async () => {
      const client = new ApiClient({
        baseURL: 'http://localhost:3000',
        tokenHooks,
        onUnauthorized,
      });

      // Set initial token
      tokenHooks.setAccessToken('old-token');

      // First request fails with 401
      mockAxios
        .onGet('/api/data')
        .replyOnce(401, { success: false, error: { code: 'UNAUTHORIZED' } });

      // Refresh endpoint returns new token
      mockAxios.onPost('/auth/refresh').replyOnce(200, {
        success: true,
        data: { accessToken: 'new-token' },
      });

      // Retry with new token succeeds
      mockAxios.onGet('/api/data').replyOnce(200, {
        success: true,
        data: { message: 'Success' },
      });

      // Make request
      const result = await client.get<{ message: string }>('/api/data');

      // Verify result
      expect(result).toEqual({ message: 'Success' });

      // Verify token was updated
      expect(tokenHooks.setAccessToken).toHaveBeenCalledWith('new-token');

      // Verify unauthorized callback was NOT called (refresh succeeded)
      expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it('should not retry if refresh endpoint itself returns 401', async () => {
      const client = new ApiClient({
        baseURL: 'http://localhost:3000',
        tokenHooks,
        onUnauthorized,
      });

      // Set initial token
      tokenHooks.setAccessToken('expired-token');

      // Refresh endpoint fails with 401
      mockAxios.onPost('/auth/refresh').replyOnce(401, {
        success: false,
        error: { code: 'REFRESH_TOKEN_EXPIRED' },
      });

      // Try to make a request that will trigger refresh
      mockAxios.onGet('/api/data').replyOnce(401);

      try {
        await client.get('/api/data');
        expect.fail('Should have thrown error');
      } catch (error) {
        // Verify unauthorized callback was called
        expect(onUnauthorized).toHaveBeenCalled();

        // Verify token was cleared
        expect(tokenHooks.clearAccessToken).toHaveBeenCalled();
      }
    });

    it('should not retry login endpoint on 401', async () => {
      const client = new ApiClient({
        baseURL: 'http://localhost:3000',
        tokenHooks,
        onUnauthorized,
      });

      // Login endpoint fails with 401
      mockAxios.onPost('/auth/login').replyOnce(401, {
        success: false,
        error: { code: 'INVALID_CREDENTIALS' },
      });

      // Should not attempt refresh
      try {
        await client.post('/auth/login', {
          email: 'test@example.com',
          password: 'wrong',
        });
        expect.fail('Should have thrown error');
      } catch (error) {
        // Verify refresh was NOT called
        expect(
          mockAxios.history.post.filter(
            (req: AxiosRequestConfig) => req.url === '/auth/refresh'
          )
        ).toHaveLength(0);

        // Verify unauthorized callback was NOT called
        expect(onUnauthorized).not.toHaveBeenCalled();
      }
    });
  });

  describe('Refresh storm prevention', () => {
    it('should prevent multiple concurrent refresh requests', async () => {
      const client = new ApiClient({
        baseURL: 'http://localhost:3000',
        tokenHooks,
        onUnauthorized,
      });

      // Set initial token
      tokenHooks.setAccessToken('old-token');

      // Multiple endpoints fail with 401
      mockAxios.onGet('/api/data1').replyOnce(401);
      mockAxios.onGet('/api/data2').replyOnce(401);
      mockAxios.onGet('/api/data3').replyOnce(401);

      // Refresh endpoint returns new token (should be called ONCE)
      mockAxios.onPost('/auth/refresh').replyOnce(200, {
        success: true,
        data: { accessToken: 'new-token' },
      });

      // After refresh, all retries succeed
      mockAxios.onGet('/api/data1').replyOnce(200, {
        success: true,
        data: { result: 'data1' },
      });
      mockAxios.onGet('/api/data2').replyOnce(200, {
        success: true,
        data: { result: 'data2' },
      });
      mockAxios.onGet('/api/data3').replyOnce(200, {
        success: true,
        data: { result: 'data3' },
      });

      // Make multiple concurrent requests
      const [result1, result2, result3] = await Promise.all([
        client.get<{ result: string }>('/api/data1'),
        client.get<{ result: string }>('/api/data2'),
        client.get<{ result: string }>('/api/data3'),
      ]);

      // Verify results
      expect(result1).toEqual({ result: 'data1' });
      expect(result2).toEqual({ result: 'data2' });
      expect(result3).toEqual({ result: 'data3' });

      // Verify refresh was called ONLY ONCE
      const refreshCalls = mockAxios.history.post.filter(
        (req: AxiosRequestConfig) => req.url === '/auth/refresh'
      );
      expect(refreshCalls).toHaveLength(1);

      // Verify token was set
      expect(tokenHooks.setAccessToken).toHaveBeenCalledWith('new-token');
    });

    it('should handle refresh failure for multiple concurrent requests', async () => {
      const client = new ApiClient({
        baseURL: 'http://localhost:3000',
        tokenHooks,
        onUnauthorized,
      });

      // Set initial token
      tokenHooks.setAccessToken('old-token');

      // Multiple endpoints fail with 401
      mockAxios.onGet('/api/data1').replyOnce(401);
      mockAxios.onGet('/api/data2').replyOnce(401);

      // Refresh endpoint fails
      mockAxios.onPost('/auth/refresh').replyOnce(401, {
        success: false,
        error: { code: 'REFRESH_TOKEN_EXPIRED' },
      });

      // Make multiple concurrent requests
      try {
        await Promise.all([client.get('/api/data1'), client.get('/api/data2')]);
        expect.fail('Should have thrown error');
      } catch (error) {
        // Verify refresh was called ONLY ONCE
        const refreshCalls = mockAxios.history.post.filter(
          (req: AxiosRequestConfig) => req.url === '/auth/refresh'
        );
        expect(refreshCalls).toHaveLength(1);

        // Verify unauthorized callback was called
        expect(onUnauthorized).toHaveBeenCalled();

        // Verify token was cleared
        expect(tokenHooks.clearAccessToken).toHaveBeenCalled();
      }
    });
  });

  describe('Request with auth token', () => {
    it('should include Authorization header when token is available', async () => {
      const client = new ApiClient({
        baseURL: 'http://localhost:3000',
        tokenHooks,
        onUnauthorized,
      });

      // Set token
      tokenHooks.setAccessToken('test-token');

      // Mock successful request
      mockAxios.onGet('/api/data').reply((config: AxiosRequestConfig) => {
        // Verify Authorization header
        expect(config.headers?.Authorization).toBe('Bearer test-token');
        return [200, { success: true, data: { result: 'success' } }];
      });

      await client.get('/api/data');
    });

    it('should not include Authorization header when token is not available', async () => {
      const client = new ApiClient({
        baseURL: 'http://localhost:3000',
        tokenHooks,
        onUnauthorized,
      });

      // No token set

      // Mock successful request
      mockAxios.onGet('/api/data').reply((config: AxiosRequestConfig) => {
        // Verify Authorization header is not present
        expect(config.headers?.Authorization).toBeUndefined();
        return [200, { success: true, data: { result: 'success' } }];
      });

      await client.get('/api/data');
    });
  });

  describe('Backwards compatibility', () => {
    it('should support legacy string constructor', async () => {
      const client = new ApiClient('http://localhost:3000');

      // Mock successful request
      mockAxios.onGet('/api/data').reply(200, {
        success: true,
        data: { result: 'success' },
      });

      const result = await client.get<{ result: string }>('/api/data');
      expect(result).toEqual({ result: 'success' });
    });
  });
});
