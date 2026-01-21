import { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { ProjectsService } from '../services/projectsService.js';

export async function listProjects(_req: Request, res: Response): Promise<void> {
    try {
        const projectsService = new ProjectsService(supabaseAdmin);
        const projects = await projectsService.listProjects();
        res.status(200).json({
            success: true,
            data: projects,
        });
    } catch (error) {
        console.error('List projects error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}
