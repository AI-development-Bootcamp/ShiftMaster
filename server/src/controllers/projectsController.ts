import { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { ProjectsService, ProjectNotFoundError, InvalidReferenceError } from '../services/projectsService.js';
import { Actor, AuthorizationError } from '../services/usersService.js';
import { createProjectSchema, updateProjectSchema, getProjectSchema } from '../validations/projectValidation.js';

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

export async function createProject(req: Request, res: Response): Promise<void> {
    try {
        const validation = createProjectSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    details: validation.error.errors,
                },
            });
            return;
        }

        const actor: Actor = { role: req.user!.role };
        const projectsService = new ProjectsService(supabaseAdmin);

        const newProject = await projectsService.createProject(actor, validation.data);

        res.status(201).json({
            success: true,
            data: newProject,
        });
    } catch (error) {
        console.error('Create project error:', error);

        if (error instanceof AuthorizationError) {
            res.status(403).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }

        if (error instanceof InvalidReferenceError) {
            res.status(400).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}

export async function updateProject(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const idValidation = getProjectSchema.safeParse({ id });

        if (!idValidation.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid project ID',
                    code: 'VALIDATION_ERROR',
                },
            });
            return;
        }

        const validation = updateProjectSchema.safeParse(req.body);

        if (!validation.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation failed',
                    code: 'VALIDATION_ERROR',
                    details: validation.error.errors,
                },
            });
            return;
        }

        const actor: Actor = { role: req.user!.role };
        const projectsService = new ProjectsService(supabaseAdmin);

        const updatedProject = await projectsService.updateProject(actor, id, validation.data);

        res.status(200).json({
            success: true,
            data: updatedProject,
        });

    } catch (error) {
        console.error('Update project error:', error);

        if (error instanceof AuthorizationError) {
            res.status(403).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }

        if (error instanceof ProjectNotFoundError) {
            res.status(404).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }

        if (error instanceof InvalidReferenceError) {
            res.status(400).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}

export async function deleteProject(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const idValidation = getProjectSchema.safeParse({ id });

        if (!idValidation.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid project ID',
                    code: 'VALIDATION_ERROR',
                },
            });
            return;
        }

        const actor: Actor = { role: req.user!.role };
        const projectsService = new ProjectsService(supabaseAdmin);

        await projectsService.deleteProject(actor, id);

        res.status(200).json({
            success: true,
            message: `Project ${id} has been deactivated`,
        });

    } catch (error) {
        console.error('Delete project error:', error);

        if (error instanceof AuthorizationError) {
            res.status(403).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }

        if (error instanceof ProjectNotFoundError) {
            res.status(404).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                },
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}
