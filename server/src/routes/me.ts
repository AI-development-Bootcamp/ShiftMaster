import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth.js';
import { getTaskTree } from '../controllers/meController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/me/task-tree:
 *   get:
 *     summary: Get user's assigned task tree
 *     description: Get hierarchical structure of projects and tasks assigned to the current user
 *     tags: [Me]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: include_inactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include inactive tasks and projects
 *       - in: query
 *         name: project_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by specific project ID
 *     responses:
 *       200:
 *         description: Task tree retrieved successfully
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
 *                     projects:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           project_id:
 *                             type: string
 *                             format: uuid
 *                           project_name:
 *                             type: string
 *                           client_id:
 *                             type: string
 *                             format: uuid
 *                           client_name:
 *                             type: string
 *                           time_format_type:
 *                             type: string
 *                             enum: [start_end, sum]
 *                           active:
 *                             type: boolean
 *                           tasks:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 task_id:
 *                                   type: string
 *                                   format: uuid
 *                                 task_name:
 *                                   type: string
 *                                 task_description:
 *                                   type: string
 *                                   nullable: true
 *                                 start_date:
 *                                   type: string
 *                                   format: date
 *                                   nullable: true
 *                                 end_date:
 *                                   type: string
 *                                   format: date
 *                                   nullable: true
 *                                 active:
 *                                   type: boolean
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/task-tree', isAuthenticated, getTaskTree);

export default router;
