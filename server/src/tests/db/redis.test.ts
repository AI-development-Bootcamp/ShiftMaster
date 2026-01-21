/**
 * Tests for Redis session management
 */

import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import RedisMock from 'ioredis-mock';

// Mock ioredis before importing db/redis.js
vi.mock('ioredis', () => ({
  Redis: RedisMock,
  default: RedisMock,
}));

import {
  setRefreshSession,
  getRefreshSession,
  deleteRefreshSession,
  updateRefreshSession,
  revokeAllUserSessions,
  getUserSessionCount,
  getUserSessionIds,
  getRedisClient,
  disconnectRedis,
  type RefreshSession,
} from '../../db/redis.js';

describe('Redis Session Management', () => {
  const testUserId = 'test-user-123';
  const testSessionId1 = 'session-1';
  const testSessionId2 = 'session-2';
  const testSessionId3 = 'session-3';

  const mockSession1: RefreshSession = {
    userId: testUserId,
    refreshTokenHash: 'hash1',
    createdAt: new Date().toISOString(),
    userAgent: 'test-agent',
    ipAddress: '127.0.0.1',
  };

  const mockSession2: RefreshSession = {
    userId: testUserId,
    refreshTokenHash: 'hash2',
    createdAt: new Date().toISOString(),
    userAgent: 'test-agent-2',
    ipAddress: '127.0.0.2',
  };

  const otherUserSession: RefreshSession = {
    userId: 'other-user-456',
    refreshTokenHash: 'hash3',
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    // Clean up test data before each test
    const client = getRedisClient();
    await client.del(`refresh:${testSessionId1}`);
    await client.del(`refresh:${testSessionId2}`);
    await client.del(`refresh:${testSessionId3}`);
    await client.del(`user_sessions:${testUserId}`);
    await client.del(`user_sessions:other-user-456`);
  });

  afterAll(async () => {
    // Clean up and disconnect after all tests
    const client = getRedisClient();
    await client.del(`refresh:${testSessionId1}`);
    await client.del(`refresh:${testSessionId2}`);
    await client.del(`refresh:${testSessionId3}`);
    await client.del(`user_sessions:${testUserId}`);
    await client.del(`user_sessions:other-user-456`);
    await disconnectRedis();
  });

  describe('setRefreshSession', () => {
    it('should store session data and add to user session set', async () => {
      await setRefreshSession(testSessionId1, mockSession1);

      // Verify session data is stored
      const session = await getRefreshSession(testSessionId1);
      expect(session).toEqual(mockSession1);

      // Verify session ID is in user's session set
      const sessionIds = await getUserSessionIds(testUserId);
      expect(sessionIds).toContain(testSessionId1);
    });

    it('should store multiple sessions for the same user', async () => {
      await setRefreshSession(testSessionId1, mockSession1);
      await setRefreshSession(testSessionId2, mockSession2);

      // Verify both sessions are stored
      const session1 = await getRefreshSession(testSessionId1);
      const session2 = await getRefreshSession(testSessionId2);
      expect(session1).toEqual(mockSession1);
      expect(session2).toEqual(mockSession2);

      // Verify both session IDs are in user's session set
      const sessionIds = await getUserSessionIds(testUserId);
      expect(sessionIds).toHaveLength(2);
      expect(sessionIds).toContain(testSessionId1);
      expect(sessionIds).toContain(testSessionId2);
    });

    it('should set expiry on session data', async () => {
      const shortTTL = 2; // 2 seconds
      await setRefreshSession(testSessionId1, mockSession1, shortTTL);

      // Session should exist immediately
      const session = await getRefreshSession(testSessionId1);
      expect(session).toEqual(mockSession1);

      // Wait for expiry
      await new Promise((resolve) => setTimeout(resolve, 2500));

      // Session should be expired
      const expiredSession = await getRefreshSession(testSessionId1);
      expect(expiredSession).toBeNull();
    });
  });

  describe('getRefreshSession', () => {
    it('should return null for non-existent session', async () => {
      const session = await getRefreshSession('non-existent');
      expect(session).toBeNull();
    });

    it('should retrieve stored session data', async () => {
      await setRefreshSession(testSessionId1, mockSession1);

      const session = await getRefreshSession(testSessionId1);
      expect(session).toEqual(mockSession1);
    });
  });

  describe('deleteRefreshSession', () => {
    it('should delete session data and remove from user session set', async () => {
      await setRefreshSession(testSessionId1, mockSession1);

      // Verify session exists
      const sessionBefore = await getRefreshSession(testSessionId1);
      expect(sessionBefore).toEqual(mockSession1);

      // Delete session
      const deleted = await deleteRefreshSession(testSessionId1);
      expect(deleted).toBe(true);

      // Verify session is deleted
      const sessionAfter = await getRefreshSession(testSessionId1);
      expect(sessionAfter).toBeNull();

      // Verify session ID is removed from user's session set
      const sessionIds = await getUserSessionIds(testUserId);
      expect(sessionIds).not.toContain(testSessionId1);
    });

    it('should return false for non-existent session', async () => {
      const deleted = await deleteRefreshSession('non-existent');
      expect(deleted).toBe(false);
    });

    it('should not affect other sessions when deleting one', async () => {
      await setRefreshSession(testSessionId1, mockSession1);
      await setRefreshSession(testSessionId2, mockSession2);

      // Delete first session
      await deleteRefreshSession(testSessionId1);

      // Verify second session still exists
      const session2 = await getRefreshSession(testSessionId2);
      expect(session2).toEqual(mockSession2);

      // Verify user's session set contains only second session
      const sessionIds = await getUserSessionIds(testUserId);
      expect(sessionIds).toHaveLength(1);
      expect(sessionIds).toContain(testSessionId2);
    });
  });

  describe('updateRefreshSession', () => {
    it('should update session data while preserving other fields', async () => {
      await setRefreshSession(testSessionId1, mockSession1);

      // Update refresh token hash
      const updated = await updateRefreshSession(testSessionId1, {
        refreshTokenHash: 'new-hash',
      });
      expect(updated).toBe(true);

      // Verify update
      const session = await getRefreshSession(testSessionId1);
      expect(session?.refreshTokenHash).toBe('new-hash');
      expect(session?.userId).toBe(testUserId);
      expect(session?.userAgent).toBe('test-agent');
    });

    it('should return false for non-existent session', async () => {
      const updated = await updateRefreshSession('non-existent', {
        refreshTokenHash: 'new-hash',
      });
      expect(updated).toBe(false);
    });
  });

  describe('revokeAllUserSessions', () => {
    it('should delete all sessions for a specific user', async () => {
      // Create multiple sessions for test user
      await setRefreshSession(testSessionId1, mockSession1);
      await setRefreshSession(testSessionId2, mockSession2);

      // Create session for other user
      await setRefreshSession(testSessionId3, otherUserSession);

      // Verify sessions exist
      expect(await getUserSessionCount(testUserId)).toBe(2);
      expect(await getUserSessionCount('other-user-456')).toBe(1);

      // Revoke all sessions for test user
      const deletedCount = await revokeAllUserSessions(testUserId);
      expect(deletedCount).toBe(2);

      // Verify test user sessions are deleted
      expect(await getRefreshSession(testSessionId1)).toBeNull();
      expect(await getRefreshSession(testSessionId2)).toBeNull();
      expect(await getUserSessionCount(testUserId)).toBe(0);

      // Verify other user session still exists
      expect(await getRefreshSession(testSessionId3)).not.toBeNull();
      expect(await getUserSessionCount('other-user-456')).toBe(1);
    });

    it('should return 0 for user with no sessions', async () => {
      const deletedCount = await revokeAllUserSessions('user-with-no-sessions');
      expect(deletedCount).toBe(0);
    });

    it('should delete user session set', async () => {
      await setRefreshSession(testSessionId1, mockSession1);
      await setRefreshSession(testSessionId2, mockSession2);

      // Revoke all sessions
      await revokeAllUserSessions(testUserId);

      // Verify user session set is deleted
      const client = getRedisClient();
      const setExists = await client.exists(`user_sessions:${testUserId}`);
      expect(setExists).toBe(0);
    });
  });

  describe('getUserSessionCount', () => {
    it('should return 0 for user with no sessions', async () => {
      const count = await getUserSessionCount('user-with-no-sessions');
      expect(count).toBe(0);
    });

    it('should return correct count of user sessions', async () => {
      await setRefreshSession(testSessionId1, mockSession1);
      await setRefreshSession(testSessionId2, mockSession2);

      const count = await getUserSessionCount(testUserId);
      expect(count).toBe(2);
    });

    it('should update count when sessions are added or removed', async () => {
      // Initially 0
      expect(await getUserSessionCount(testUserId)).toBe(0);

      // Add session
      await setRefreshSession(testSessionId1, mockSession1);
      expect(await getUserSessionCount(testUserId)).toBe(1);

      // Add another session
      await setRefreshSession(testSessionId2, mockSession2);
      expect(await getUserSessionCount(testUserId)).toBe(2);

      // Delete one session
      await deleteRefreshSession(testSessionId1);
      expect(await getUserSessionCount(testUserId)).toBe(1);

      // Delete last session
      await deleteRefreshSession(testSessionId2);
      expect(await getUserSessionCount(testUserId)).toBe(0);
    });
  });

  describe('getUserSessionIds', () => {
    it('should return empty array for user with no sessions', async () => {
      const sessionIds = await getUserSessionIds('user-with-no-sessions');
      expect(sessionIds).toEqual([]);
    });

    it('should return all session IDs for a user', async () => {
      await setRefreshSession(testSessionId1, mockSession1);
      await setRefreshSession(testSessionId2, mockSession2);

      const sessionIds = await getUserSessionIds(testUserId);
      expect(sessionIds).toHaveLength(2);
      expect(sessionIds).toContain(testSessionId1);
      expect(sessionIds).toContain(testSessionId2);
    });
  });
});
