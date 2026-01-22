import { Router } from 'express';
import { clockIn, clockOut, getTimeline } from '../controllers/entriesController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(isAuthenticated);

/**
 * @swagger
 * /api/v1/entries/clock-in:
 *   post:
 *     summary: Clock in to start work timer
 *     description: Creates a new work entry with start_time. User can only have one active timer per day.
 *     tags: [Time Tracking]
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
 *               - start_time
 *             properties:
 *               work_date:
 *                 type: string
 *                 format: date
 *                 pattern: '^\d{4}-\d{2}-\d{2}$'
 *                 description: Date of work entry (YYYY-MM-DD)
 *                 example: "2026-01-22"
 *               start_time:
 *                 type: string
 *                 pattern: '^\d{2}:\d{2}:\d{2}$'
 *                 description: Work start time (HH:MM:SS)
 *                 example: "09:00:00"
 *     responses:
 *       201:
 *         description: Clock in successful - timer started
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
 *                     entry_id:
 *                       type: string
 *                       description: Unique entry identifier
 *                       example: "123"
 *                     user_id:
 *                       type: string
 *                       format: uuid
 *                       description: User who created the entry
 *                       example: "550e8400-e29b-41d4-a716-446655440000"
 *                     entry_kind:
 *                       type: string
 *                       enum: [work, absence]
 *                       example: work
 *                     work_date:
 *                       type: string
 *                       format: date
 *                       example: "2026-01-22"
 *                     start_time:
 *                       type: string
 *                       example: "09:00:00"
 *                     end_time:
 *                       type: string
 *                       nullable: true
 *                       description: Will be null for active timer
 *                       example: null
 *       400:
 *         description: Validation error - invalid date or time format
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
 *                       example: "Validation failed"
 *                     code:
 *                       type: string
 *                       example: VALIDATION_ERROR
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                       example: [{"path": ["work_date"], "message": "Invalid date format (YYYY-MM-DD)"}]
 *       403:
 *         description: Month is locked - cannot modify entries
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
 *                       example: "Cannot modify entries for 2026-01-22 - month is locked"
 *                     code:
 *                       type: string
 *                       example: MONTH_LOCKED
 *       409:
 *         description: Active timer already exists for today
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
 *                       example: "An active timer already exists for today"
 *                     code:
 *                       type: string
 *                       example: ACTIVE_TIMER_EXISTS
 *       500:
 *         description: Internal server error
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
 *                       example: "Internal server error"
 *                     code:
 *                       type: string
 *                       example: INTERNAL_SERVER_ERROR
 */
router.post('/clock-in', clockIn);

/**
 * @swagger
 * /api/v1/entries/{id}/clock-out:
 *   patch:
 *     summary: Clock out to stop work timer
 *     description: Updates work entry with end_time and creates task assignment. Validates time overlap, daily limits, and task assignment.
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Entry ID to clock out
 *         example: "123"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - end_time
 *               - task_id
 *               - location
 *             properties:
 *               end_time:
 *                 type: string
 *                 pattern: '^\d{2}:\d{2}:\d{2}$'
 *                 description: Work end time (HH:MM:SS)
 *                 example: "17:00:00"
 *               task_id:
 *                 type: string
 *                 description: ID of the task worked on (user must be assigned to this task)
 *                 example: "456"
 *               location:
 *                 type: string
 *                 enum: [Office, Client, Home]
 *                 description: Work location
 *                 example: "Office"
 *     responses:
 *       200:
 *         description: Clock out successful - timer stopped and task assigned
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
 *                     entry_id:
 *                       type: string
 *                       example: "123"
 *                     work_date:
 *                       type: string
 *                       format: date
 *                       example: "2026-01-22"
 *                     start_time:
 *                       type: string
 *                       example: "09:00:00"
 *                     end_time:
 *                       type: string
 *                       example: "17:00:00"
 *       400:
 *         description: Validation error, time overlap, or daily limit exceeded
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
 *                       example: "Time range 09:00:00-17:00:00 overlaps with existing entry 08:00:00-10:00:00"
 *                     code:
 *                       type: string
 *                       enum: [VALIDATION_ERROR, TIME_OVERLAP, DAILY_LIMIT_EXCEEDED, INVALID_ENTRY_STATE]
 *                       example: TIME_OVERLAP
 *       403:
 *         description: Month locked or user not assigned to task
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
 *                       example: "User is not assigned to task 456"
 *                     code:
 *                       type: string
 *                       enum: [MONTH_LOCKED, TASK_NOT_ASSIGNED]
 *                       example: TASK_NOT_ASSIGNED
 *       404:
 *         description: Entry not found or does not belong to user
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
 *                       example: "Entry with ID 123 not found"
 *                     code:
 *                       type: string
 *                       example: ENTRY_NOT_FOUND
 *       500:
 *         description: Internal server error
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
 *                       example: "Internal server error"
 *                     code:
 *                       type: string
 *                       example: INTERNAL_SERVER_ERROR
 */
router.patch('/:id/clock-out', clockOut);

/**
 * @swagger
 * /api/v1/entries/timeline:
 *   get:
 *     summary: Get unified timeline of work entries and absences
 *     description: Returns all entries (work + absence) for a user, grouped by date with task and project details
 *     tags: [Time Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *         description: User ID to fetch timeline for (admin only, defaults to authenticated user)
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for timeline filter (YYYY-MM-DD, defaults to start of current month)
 *         example: "2026-01-01"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for timeline filter (YYYY-MM-DD, defaults to end of current month)
 *         example: "2026-01-31"
 *     responses:
 *       200:
 *         description: Timeline data retrieved successfully
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
 *                     timeline:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           work_date:
 *                             type: string
 *                             format: date
 *                             example: "2026-01-22"
 *                           total_work_minutes:
 *                             type: number
 *                             description: Total work time in minutes for the day
 *                             example: 480
 *                           entries:
 *                             type: array
 *                             description: Work entries for the day
 *                             items:
 *                               type: object
 *                               properties:
 *                                 entry_id:
 *                                   type: string
 *                                   example: "123"
 *                                 entry_kind:
 *                                   type: string
 *                                   enum: [work, absence]
 *                                   example: work
 *                                 start_time:
 *                                   type: string
 *                                   example: "09:00:00"
 *                                 end_time:
 *                                   type: string
 *                                   nullable: true
 *                                   example: "17:00:00"
 *                                 is_active:
 *                                   type: boolean
 *                                   description: True if timer is still running (end_time is null)
 *                                   example: false
 *                                 is_locked:
 *                                   type: boolean
 *                                   description: True if the month is locked
 *                                   example: false
 *                                 assignments:
 *                                   type: array
 *                                   items:
 *                                     type: object
 *                                     properties:
 *                                       entry_assignment_id:
 *                                         type: string
 *                                         example: "789"
 *                                       task_id:
 *                                         type: string
 *                                         example: "456"
 *                                       task_name:
 *                                         type: string
 *                                         example: "Backend API"
 *                                       project_name:
 *                                         type: string
 *                                         example: "TimeTracker"
 *                                       location:
 *                                         type: string
 *                                         enum: [Office, Client, Home]
 *                                         example: "Office"
 *                                       duration_minutes:
 *                                         type: number
 *                                         nullable: true
 *                                         example: 480
 *                           absences:
 *                             type: array
 *                             description: Absence entries for the day
 *                             items:
 *                               type: object
 *                               properties:
 *                                 entry_id:
 *                                   type: string
 *                                   example: "124"
 *                                 entry_kind:
 *                                   type: string
 *                                   enum: [work, absence]
 *                                   example: absence
 *                                 absence_type:
 *                                   type: string
 *                                   example: "sick"
 *                                 description:
 *                                   type: string
 *                                   nullable: true
 *                                   example: "Doctor appointment"
 *                                 is_locked:
 *                                   type: boolean
 *                                   example: false
 *       403:
 *         description: User not authorized to view another user's timeline
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
 *                       example: "Forbidden: Admin access required to view other user's timeline"
 *                     code:
 *                       type: string
 *                       example: FORBIDDEN
 *       500:
 *         description: Internal server error
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
 *                       example: "Internal server error"
 *                     code:
 *                       type: string
 *                       example: INTERNAL_SERVER_ERROR
 */
router.get('/timeline', getTimeline);

export default router;
