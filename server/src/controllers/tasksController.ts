import { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { TasksService, TaskNotFoundError, InvalidReferenceError } from '../services/tasksService.js';
import { AssignmentsService } from '../services/assignmentsService.js';
import { Actor, AuthorizationError } from '../services/usersService.js';
import { createTaskSchema, updateTaskSchema, getTaskSchema } from '../validations/taskValidation.js';

export async function listTasks(_req: Request, res: Response): Promise<void> {
    try {
        const tasksService = new TasksService(supabaseAdmin);
        const tasks = await tasksService.listTasks();
        res.status(200).json({
            success: true,
            data: tasks,
        });
    } catch (error) {
        console.error('List tasks error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}

export async function createTask(req: Request, res: Response): Promise<void> {
    try {
        const validation = createTaskSchema.safeParse(req.body);

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
        const tasksService = new TasksService(supabaseAdmin);

        const newTask = await tasksService.createTask(actor, validation.data);

        res.status(201).json({
            success: true,
            data: newTask,
        });
    } catch (error) {
        console.error('Create task error:', error);

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

export async function updateTask(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const idValidation = getTaskSchema.safeParse({ id });

        if (!idValidation.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid task ID',
                    code: 'VALIDATION_ERROR',
                },
            });
            return;
        }

        const validation = updateTaskSchema.safeParse(req.body);

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
        const tasksService = new TasksService(supabaseAdmin);

        const updatedTask = await tasksService.updateTask(actor, id, validation.data);

        res.status(200).json({
            success: true,
            data: updatedTask,
        });

    } catch (error) {
        console.error('Update task error:', error);

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

        if (error instanceof TaskNotFoundError) {
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

export async function deleteTask(req: Request, res: Response): Promise<void> {
    try {
        const { id } = req.params;
        const idValidation = getTaskSchema.safeParse({ id });

        if (!idValidation.success) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'Invalid task ID',
                    code: 'VALIDATION_ERROR',
                },
            });
            return;
        }

        const actor: Actor = { role: req.user!.role };
        const tasksService = new TasksService(supabaseAdmin);

        await tasksService.deleteTask(actor, id);

        res.status(200).json({
            success: true,
            message: `Task ${id} has been deactivated`,
        });

    } catch (error) {
        console.error('Delete task error:', error);

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

        if (error instanceof TaskNotFoundError) {
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

export async function getAssignments(req: Request, res: Response): Promise<void> {
    try {
        const { taskId } = req.params;
        const assignmentsService = new AssignmentsService(supabaseAdmin);
        const assignments = await assignmentsService.getAssignmentsByTaskId(taskId);
        res.status(200).json({
            success: true,
            data: assignments,
        });
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}

export async function getAllAssignments(_req: Request, res: Response): Promise<void> {
    try {
        const assignmentsService = new AssignmentsService(supabaseAdmin);
        const assignments = await assignmentsService.getAllActiveAssignments();
        res.status(200).json({
            success: true,
            data: assignments,
        });
    } catch (error) {
        console.error('Get all assignments error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}

export async function assignEmployees(req: Request, res: Response): Promise<void> {
    try {
        const { taskId } = req.params;
        const { employeeIds } = req.body;

        if (!Array.isArray(employeeIds)) {
            res.status(400).json({
                success: false,
                error: {
                    message: 'employeeIds must be an array',
                    code: 'VALIDATION_ERROR',
                },
            });
            return;
        }

        const actor: Actor = { role: req.user!.role };
        const userId = req.user!.userId;

        const assignmentsService = new AssignmentsService(supabaseAdmin);
        await assignmentsService.assignEmployees(actor, userId, taskId, employeeIds);

        res.status(200).json({
            success: true,
            message: 'Assignments updated successfully'
        });
    } catch (error) {
        console.error('Assign employees error:', error);
        res.status(500).json({
            success: false,
            error: {
                message: 'Internal server error',
                code: 'INTERNAL_SERVER_ERROR',
            },
        });
    }
}
