/**
 * Redis client singleton for refresh token session management
 * Uses ioredis for better TypeScript support and production-ready features
 */

import { Redis } from 'ioredis';
import { env } from '../config/env.js';

/**
 * Singleton Redis client instance
 */
let redisClient: Redis | null = null;

/**
 * Get or create the singleton Redis client
 * Connects to REDIS_URL from environment (defaults to redis://localhost:6379)
 *
 * @returns {Redis} The Redis client instance
 */
export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.redisUrl, {
      // Connection retry strategy
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        console.log(
          `Redis connection retry attempt ${times}, waiting ${delay}ms`
        );
        return delay;
      },
      // Max retry attempts before giving up
      maxRetriesPerRequest: 3,
      // Enable offline queue for commands during reconnection
      enableOfflineQueue: true,
      // Lazy connect - don't connect immediately, wait for first command
      lazyConnect: false,
    });

    // Connection event handlers
    redisClient.on('connect', () => {
      console.log('Redis client connecting...');
    });

    redisClient.on('ready', () => {
      console.log('Redis client connected successfully');
    });

    redisClient.on('error', (err) => {
      console.error('Redis client error:', err.message);
    });

    redisClient.on('close', () => {
      console.log('Redis client connection closed');
    });

    redisClient.on('reconnecting', () => {
      console.log('Redis client reconnecting...');
    });
  }

  return redisClient;
}

/**
 * Check if Redis is connected and healthy
 *
 * @returns {Promise<boolean>} True if Redis is connected and responsive
 */
export async function isRedisHealthy(): Promise<boolean> {
  const client = getRedisClient();

  try {
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

/**
 * Gracefully disconnect the Redis client
 * Use this during server shutdown
 *
 * @returns {Promise<void>}
 */
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis client disconnected');
  }
}

/**
 * Refresh token session data stored in Redis
 *
 * Redis Data Structure:
 * - Session data: `refresh:{sessionId}` → JSON string of RefreshSession
 * - User sessions: `user_sessions:{userId}` → Set of session IDs
 *
 * This allows O(M) revocation where M is the user's session count,
 * instead of O(N) where N is all sessions in Redis.
 */
export interface RefreshSession {
  userId: string;
  refreshTokenHash: string;
  createdAt: string;
  userAgent?: string;
  ipAddress?: string;
}

/**
 * Store a refresh token session in Redis
 * Also adds the session ID to the user's session set for efficient revocation
 *
 * @param {string} sessionId - UUID for the session
 * @param {RefreshSession} sessionData - Session data to store
 * @param {number} ttlSeconds - Time to live in seconds (default: 30 days)
 * @returns {Promise<void>}
 */
export async function setRefreshSession(
  sessionId: string,
  sessionData: RefreshSession,
  ttlSeconds: number = 30 * 24 * 60 * 60 // 30 days
): Promise<void> {
  const client = getRedisClient();
  const sessionKey = `refresh:${sessionId}`;
  const userSessionsKey = `user_sessions:${sessionData.userId}`;
  const value = JSON.stringify(sessionData);

  // Use pipeline for atomic operations
  const pipeline = client.pipeline();

  // Store the session data
  pipeline.setex(sessionKey, ttlSeconds, value);

  // Add session ID to user's session set
  pipeline.sadd(userSessionsKey, sessionId);

  // Set expiry on user's session set (slightly longer than session TTL)
  pipeline.expire(userSessionsKey, ttlSeconds + 86400); // +1 day buffer

  await pipeline.exec();
}

/**
 * Get a refresh token session from Redis
 *
 * @param {string} sessionId - UUID for the session
 * @returns {Promise<RefreshSession | null>} Session data or null if not found/expired
 */
export async function getRefreshSession(
  sessionId: string
): Promise<RefreshSession | null> {
  const client = getRedisClient();
  const key = `refresh:${sessionId}`;

  const value = await client.get(key);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as RefreshSession;
  } catch (error) {
    console.error('Failed to parse refresh session data:', error);
    return null;
  }
}

/**
 * Delete a refresh token session from Redis
 * Also removes the session ID from the user's session set
 * Used for logout and session revocation
 *
 * @param {string} sessionId - UUID for the session
 * @returns {Promise<boolean>} True if session was deleted, false if it didn't exist
 */
export async function deleteRefreshSession(
  sessionId: string
): Promise<boolean> {
  const client = getRedisClient();
  const sessionKey = `refresh:${sessionId}`;

  // Get session data to find userId before deleting
  const session = await getRefreshSession(sessionId);

  if (!session) {
    return false;
  }

  const userSessionsKey = `user_sessions:${session.userId}`;

  // Use pipeline for atomic operations
  const pipeline = client.pipeline();

  // Delete the session data
  pipeline.del(sessionKey);

  // Remove session ID from user's session set
  pipeline.srem(userSessionsKey, sessionId);

  const results = await pipeline.exec();

  // First command is DEL, check if it deleted something
  return results?.[0]?.[1] === 1;
}

/**
 * Update an existing refresh token session (for token rotation)
 *
 * @param {string} sessionId - UUID for the session
 * @param {Partial<RefreshSession>} updates - Fields to update
 * @returns {Promise<boolean>} True if session was updated, false if it didn't exist
 */
export async function updateRefreshSession(
  sessionId: string,
  updates: Partial<RefreshSession>
): Promise<boolean> {
  const client = getRedisClient();
  const key = `refresh:${sessionId}`;

  // Get existing session
  const existingSession = await getRefreshSession(sessionId);
  if (!existingSession) {
    return false;
  }

  // Merge updates with existing data
  const updatedSession: RefreshSession = {
    ...existingSession,
    ...updates,
  };

  // Get remaining TTL
  const ttl = await client.ttl(key);
  if (ttl <= 0) {
    // Session expired or doesn't exist
    return false;
  }

  // Update with same TTL
  const value = JSON.stringify(updatedSession);
  await client.setex(key, ttl, value);

  return true;
}

/**
 * Delete all refresh token sessions for a specific user
 * Uses per-user session set for O(M) performance where M is the user's session count
 * Useful for password changes or account security events
 *
 * @param {string} userId - User ID to revoke all sessions for
 * @returns {Promise<number>} Number of sessions deleted
 */
export async function revokeAllUserSessions(userId: string): Promise<number> {
  const client = getRedisClient();
  const userSessionsKey = `user_sessions:${userId}`;

  // Get all session IDs for this user from the set
  const sessionIds = await client.smembers(userSessionsKey);

  if (sessionIds.length === 0) {
    return 0;
  }

  let deletedCount = 0;

  // Delete all sessions for this user
  const pipeline = client.pipeline();

  for (const sessionId of sessionIds) {
    const sessionKey = `refresh:${sessionId}`;
    pipeline.del(sessionKey);
  }

  // Delete the user's session set
  pipeline.del(userSessionsKey);

  const results = await pipeline.exec();

  if (!results) {
    return 0;
  }

  // Count successful deletions (excluding the final set deletion)
  for (let i = 0; i < sessionIds.length; i++) {
    if (results[i]?.[1] === 1) {
      deletedCount++;
    }
  }

  return deletedCount;
}

/**
 * Get the count of active sessions for a specific user
 * Useful for monitoring and debugging
 *
 * @param {string} userId - User ID to count sessions for
 * @returns {Promise<number>} Number of active sessions
 */
export async function getUserSessionCount(userId: string): Promise<number> {
  const client = getRedisClient();
  const userSessionsKey = `user_sessions:${userId}`;

  return await client.scard(userSessionsKey);
}

/**
 * Get all session IDs for a specific user
 * Useful for admin interfaces or debugging
 *
 * @param {string} userId - User ID to get sessions for
 * @returns {Promise<string[]>} Array of session IDs
 */
export async function getUserSessionIds(userId: string): Promise<string[]> {
  const client = getRedisClient();
  const userSessionsKey = `user_sessions:${userId}`;

  return await client.smembers(userSessionsKey);
}

// Initialize Redis client on module load
getRedisClient();
