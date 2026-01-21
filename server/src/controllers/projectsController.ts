/**
 * Projects controller for handling project management requests
 */

import { Request, Response } from 'express';
import {
    createProjectSchema,
    updateProjectSchema,
    listProjectsSchema,
    getProjectSchema
} from '../validations/projectValidation.js';
import {
    ProjectsService,
    DuplicateProjectError,
    ProjectNotFoundError,
    AuthorizationError,
    ClientNotFoundError
} from '../services/projectsService.js';
import { UserNotFoundError } from '../services/usersService.js';
import { ProjectRepository } from '../db/repositories/ProjectRepository.js';
import { ClientRepository } from '../db/repositories/ClientRepository.js';
import { UserRepository } from '../db/repositories/UserRepository.js';
import { supabaseAdmin } from '../db/supabase.js';

/**
 * Handle POST /api/v1/projects - Create new project
 * @admin_only
 */
export async function createProject(req: Request, res: Response): Promise<void> {
    try {
        const validationResult = createProjectSchema.safeParse(req);

        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    code: 'VALIDATION_ERROR',
                    details: validationResult.error.flatten().fieldErrors
                }
            });
            return;
        }

        const actor = { role: req.user!.role, userId: req.user!.userId };
        const projectRepo = new ProjectRepository(supabaseAdmin);
        const clientRepo = new ClientRepository(supabaseAdmin);
        const userRepo = new UserRepository(supabaseAdmin);
        const projectsService = new ProjectsService(projectRepo, clientRepo, userRepo);

        const project = await projectsService.createProject(actor, validationResult.data.body);

        res.status(201).json({
            success: true,
            data: { project }
        });
    } catch (error) {
        if (error instanceof DuplicateProjectError) {
            res.status(400).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code
                }
            });
            return;
        }

        if (error instanceof ClientNotFoundError || error instanceof UserNotFoundError) {
            res.status(400).json({
                success: false,
                error: {
                    message: error.message,
                    code: 'INVALID_REFERENCE'
                }
            });
            return;
        }

        if (error instanceof AuthorizationError) {
            res.status(403).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code
                }
            });
            return;
        }

        console.error('Create project error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR'
            }
        });
    }
}

/**
 * Handle GET /api/v1/projects - List projects
 * @authenticated
 */
export async function listProjects(req: Request, res: Response): Promise<void> {
    try {
        const validationResult = listProjectsSchema.safeParse(req);

        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    code: 'VALIDATION_ERROR',
                    details: validationResult.error.flatten().fieldErrors
                }
            });
            return;
        }

        const { page, limit, search, sort, include_inactive } = validationResult.data.query;

        const actor = { role: req.user!.role, userId: req.user!.userId };
        const projectRepo = new ProjectRepository(supabaseAdmin);
        const clientRepo = new ClientRepository(supabaseAdmin);
        const userRepo = new UserRepository(supabaseAdmin);
        const projectsService = new ProjectsService(projectRepo, clientRepo, userRepo);

        const result = await projectsService.listProjects(
            actor,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
            search,
            (sort as 'asc' | 'desc') || 'asc',
            include_inactive === 'true'
        );

        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('List projects error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR'
            }
        });
    }
}

/**
 * Handle GET /api/v1/projects/:id - Get project
 * @authenticated
 */
export async function getProject(req: Request, res: Response): Promise<void> {
    try {
        const validationResult = getProjectSchema.safeParse(req);

        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    code: 'VALIDATION_ERROR',
                    details: validationResult.error.flatten().fieldErrors
                }
            });
            return;
        }

        const actor = { role: req.user!.role, userId: req.user!.userId };
        const projectRepo = new ProjectRepository(supabaseAdmin);
        const clientRepo = new ClientRepository(supabaseAdmin);
        const userRepo = new UserRepository(supabaseAdmin);
        const projectsService = new ProjectsService(projectRepo, clientRepo, userRepo);

        const project = await projectsService.getProjectById(actor, validationResult.data.params.id);

        res.status(200).json({
            success: true,
            data: { project }
        });
    } catch (error) {
        if (error instanceof ProjectNotFoundError) {
            res.status(404).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code
                }
            });
            return;
        }

        console.error('Get project error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR'
            }
        });
    }
}

/**
 * Handle PATCH /api/v1/projects/:id - Update project
 * @admin_or_manager
 */
export async function updateProject(req: Request, res: Response): Promise<void> {
    try {
        const validationResult = updateProjectSchema.safeParse(req);

        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    code: 'VALIDATION_ERROR',
                    details: validationResult.error.flatten().fieldErrors
                }
            });
            return;
        }

        const actor = { role: req.user!.role, userId: req.user!.userId };
        const projectRepo = new ProjectRepository(supabaseAdmin);
        const clientRepo = new ClientRepository(supabaseAdmin);
        const userRepo = new UserRepository(supabaseAdmin);
        const projectsService = new ProjectsService(projectRepo, clientRepo, userRepo);

        const project = await projectsService.updateProject(
            actor,
            validationResult.data.params.id,
            validationResult.data.body
        );

        res.status(200).json({
            success: true,
            data: { project }
        });
    } catch (error) {
        if (error instanceof ProjectNotFoundError) {
            res.status(404).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code
                }
            });
            return;
        }

        if (error instanceof AuthorizationError) {
            res.status(403).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code
                }
            });
            return;
        }

        console.error('Update project error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR'
            }
        });
    }
}

/**
 * Handle DELETE /api/v1/projects/:id - Delete project
 * @admin_only
 */
export async function deleteProject(req: Request, res: Response): Promise<void> {
    try {
        const validationResult = getProjectSchema.safeParse(req);

        if (!validationResult.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Validation error',
                    code: 'VALIDATION_ERROR',
                    details: validationResult.error.flatten().fieldErrors
                }
            });
            return;
        }

        const actor = { role: req.user!.role, userId: req.user!.userId };
        const projectRepo = new ProjectRepository(supabaseAdmin);
        const clientRepo = new ClientRepository(supabaseAdmin);
        const userRepo = new UserRepository(supabaseAdmin);
        const projectsService = new ProjectsService(projectRepo, clientRepo, userRepo);

        await projectsService.deleteProject(actor, validationResult.data.params.id);

        res.status(200).json({
            success: true,
            data: { message: 'Project deleted successfully' }
        });
    } catch (error) {
        if (error instanceof ProjectNotFoundError) {
            res.status(404).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code
                }
            });
            return;
        }

        if (error instanceof AuthorizationError) {
            res.status(403).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code
                }
            });
            return;
        }

        console.error('Delete project error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR'
            }
        });
    }
}
