import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { create, list } from '../controllers/absencesController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/absences:
 *   post:
 *     summary: Create an absence entry
 *     description: Create absence entry for single day or date range
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - absence_type
 *             properties:
 *               work_date:
 *                 type: string
 *                 format: date
 *                 description: Single day absence (YYYY-MM-DD)
 *                 example: "2026-01-22"
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: Start of absence range (YYYY-MM-DD)
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: End of absence range (YYYY-MM-DD)
 *               absence_type:
 *                 type: string
 *                 enum: [sick, vacation, vacation_partial, reserve, other]
 *                 description: Type of absence
 *                 example: "vacation"
 *               description:
 *                 type: string
 *                 nullable: true
 *                 description: Optional description
 *               attachment_path:
 *                 type: string
 *                 nullable: true
 *                 description: Path to attachment file
 *     responses:
 *       201:
 *         description: Absence created successfully
 *       400:
 *         description: Validation error or month locked
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', isAuthenticated, create);

/**
 * @swagger
 * /api/v1/absences:
 *   get:
 *     summary: List absences
 *     description: Get absences for the authenticated user within a date range
 *     tags: [Absences]
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
 *       - in: query
 *         name: absence_type
 *         schema:
 *           type: string
 *           enum: [sick, vacation, vacation_partial, reserve, other]
 *         description: Filter by absence type
 *     responses:
 *       200:
 *         description: Absences retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/', isAuthenticated, list);

export default router;
