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
  const key = `refresh:${sessionId}`;
  const value = JSON.stringify(sessionData);

  await client.setex(key, ttlSeconds, value);
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
 * Used for logout and session revocation
 *
 * @param {string} sessionId - UUID for the session
 * @returns {Promise<boolean>} True if session was deleted, false if it didn't exist
 */
export async function deleteRefreshSession(
  sessionId: string
): Promise<boolean> {
  const client = getRedisClient();
  const key = `refresh:${sessionId}`;

  const result = await client.del(key);
  return result === 1;
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
 * Useful for password changes or account security events
 *
 * @param {string} userId - User ID to revoke all sessions for
 * @returns {Promise<number>} Number of sessions deleted
 */
export async function revokeAllUserSessions(userId: string): Promise<number> {
  const client = getRedisClient();

  // Find all refresh session keys
  const keys = await client.keys('refresh:*');

  let deletedCount = 0;
  for (const key of keys) {
    const value = await client.get(key);
    if (value) {
      try {
        const session = JSON.parse(value) as RefreshSession;
        if (session.userId === userId) {
          await client.del(key);
          deletedCount++;
        }
      } catch (error) {
        console.error('Failed to parse session during revocation:', error);
      }
    }
  }

  return deletedCount;
}

// Initialize Redis client on module load
getRedisClient();
