import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { create, list } from '../controllers/timeEntriesController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/time-entries:
 *   post:
 *     summary: Create a work entry
 *     description: Create a new work entry with task assignments for a specific date
 *     tags: [Time Entries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - work_date
 *               - assignments
 *             properties:
 *               work_date:
 *                 type: string
 *                 format: date
 *                 description: Date of the work entry
 *                 example: "2026-01-22"
 *               start_time:
 *                 type: string
 *                 nullable: true
 *                 description: Overall start time (HH:MM:SS)
 *                 example: "09:00:00"
 *               end_time:
 *                 type: string
 *                 nullable: true
 *                 description: Overall end time (HH:MM:SS)
 *                 example: "17:00:00"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Optional description
 *               assignments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - task_id
 *                     - location
 *                   properties:
 *                     task_id:
 *                       type: string
 *                       format: uuid
 *                     location:
 *                       type: string
 *                       enum: [Office, Client, Home]
 *                     start_time:
 *                       type: string
 *                       nullable: true
 *                     end_time:
 *                       type: string
 *                       nullable: true
 *                     duration_minutes:
 *                       type: number
 *                       nullable: true
 *     responses:
 *       201:
 *         description: Entry created successfully
 *       400:
 *         description: Validation error or business rule violation
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', isAuthenticated, create);

/**
 * @swagger
 * /api/v1/time-entries:
 *   get:
 *     summary: List work entries
 *     description: Get work entries for the authenticated user within a date range
 *     tags: [Time Entries]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for month-based query
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *         description: Month for month-based query (1-12)
 *     responses:
 *       200:
 *         description: Entries retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', isAuthenticated, list);

export default router;
