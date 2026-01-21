import { Request, Response } from 'express';
import { supabaseAdmin } from '../db/supabase.js';
import { TasksService } from '../services/tasksService.js';
import { AssignmentsService } from '../services/assignmentsService.js';
import { Actor } from '../services/usersService.js';

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
