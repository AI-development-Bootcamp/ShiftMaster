/**
 * Me controller for user-specific endpoints
 */

import { Request, Response } from 'express';
import { TaskTreeService } from '../services/taskTreeService.js';
import { supabaseAdmin } from '../db/supabase.js';

/**
 * Handle GET /api/v1/me/task-tree - Get user's assigned tasks
 * @authenticated
 */
export async function getTaskTree(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({
                success: false,
                error: {
                    message: 'User ID not found in token',
                    code: 'UNAUTHORIZED',
                },
            });
            return;
        }

        // Parse query params
        const includeInactive = req.query.include_inactive === 'true';
        const projectId = req.query.project_id as string | undefined;

        const taskTreeService = new TaskTreeService(supabaseAdmin);
        const taskTree = await taskTreeService.getUserTaskTree(userId, {
            includeInactive,
            projectId,
        });

        res.status(200).json({
            success: true,
            data: {
                projects: taskTree,
            },
        });
    } catch (error) {
        console.error('Get task tree error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}
