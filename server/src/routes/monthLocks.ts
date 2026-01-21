import { Router } from 'express';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';
import {
  listLocks,
  batchUpdateLocks,
} from '../controllers/monthLocksController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/month-locks:
 *   get:
 *     summary: List month locks for a specific year
 *     description: Retrieve all active month locks for a given year. All authenticated users can view locks to check which months are locked before attempting to modify entries.
 *     tags: [Month Locks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 2000
 *           maximum: 2100
 *         description: The year to fetch locks for
 *         example: 2026
 *     responses:
 *       200:
 *         description: Locks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     locks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           lock_id:
 *                             type: string
 *                             format: uuid
 *                             example: "550e8400-e29b-41d4-a716-446655440000"
 *                           year:
 *                             type: integer
 *                             example: 2026
 *                           month:
 *                             type: integer
 *                             minimum: 1
 *                             maximum: 12
 *                             example: 1
 *                           locked_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2026-02-05T09:00:00Z"
 *                           locked_by:
 *                             type: string
 *                             format: uuid
 *                             example: "550e8400-e29b-41d4-a716-446655440000"
 *       400:
 *         description: Validation error (invalid year parameter)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Validation error
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *                     details:
 *                       type: object
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/', isAuthenticated, listLocks);

/**
 * @swagger
 * /api/v1/month-locks/batch:
 *   put:
 *     summary: Batch lock or unlock multiple months
 *     description: Admin-only endpoint to lock or unlock multiple months in a single operation
 *     tags: [Month Locks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *               - operations
 *             properties:
 *               year:
 *                 type: integer
 *                 minimum: 2000
 *                 maximum: 2100
 *                 description: The year for the batch operation
 *                 example: 2026
 *               operations:
 *                 type: object
 *                 required:
 *                   - lock
 *                   - unlock
 *                 properties:
 *                   lock:
 *                     type: array
 *                     items:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 12
 *                     description: Array of month numbers to lock
 *                     example: [3, 4]
 *                   unlock:
 *                     type: array
 *                     items:
 *                       type: integer
 *                       minimum: 1
 *                       maximum: 12
 *                     description: Array of month numbers to unlock
 *                     example: [1, 2]
 *     responses:
 *       200:
 *         description: Batch operation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     locked:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       description: Months that were locked
 *                       example: [3, 4]
 *                     unlocked:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       description: Months that were unlocked
 *                       example: [1, 2]
 *       400:
 *         description: Validation error (invalid year or month numbers)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Validation error
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *                     details:
 *                       type: object
 *       401:
 *         description: Unauthorized - Missing or invalid token or user ID not found
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Internal server error
 */
router.put('/batch', isAuthenticated, isAdmin, batchUpdateLocks);

export default router;
