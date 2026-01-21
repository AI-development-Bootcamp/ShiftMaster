import { Router, Request, Response } from 'express';
import { isRedisHealthy } from '../db/redis.js';

const router = Router();
const startTime = Date.now();

/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the server including uptime, timestamp, and Redis connection status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2024-01-15T10:30:00.000Z
 *                 uptime:
 *                   type: integer
 *                   description: Server uptime in seconds
 *                   example: 3600
 *                 redis:
 *                   type: object
 *                   properties:
 *                     connected:
 *                       type: boolean
 *                       example: true
 */
router.get('/', async (_req: Request, res: Response) => {
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const redisHealthy = await isRedisHealthy();

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime,
    redis: {
      connected: redisHealthy,
    },
  });
});

export default router;
