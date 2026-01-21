import { SupabaseClient } from '@supabase/supabase-js';
import { TaskRepository } from '../db/repositories/TaskRepository.js';
import { ProjectRepository } from '../db/repositories/ProjectRepository.js';
import { Task, NewTask, UpdateTask } from '../db/types/entities.js';
import { Actor, AuthorizationError } from './usersService.js';

export class TaskNotFoundError extends Error {
    code = 'TASK_NOT_FOUND';
    constructor(taskId: string) {
        super(`Task with ID ${taskId} not found`);
        this.name = 'TaskNotFoundError';
    }
}

export class InvalidReferenceError extends Error {
    code = 'INVALID_REFERENCE';
    constructor(message: string) {
        super(message);
        this.name = 'InvalidReferenceError';
    }
}

export class TasksService {
    private taskRepo: TaskRepository;
    private projectRepo: ProjectRepository;

    constructor(client: SupabaseClient) {
        this.taskRepo = new TaskRepository(client);
        this.projectRepo = new ProjectRepository(client);
    }

    async listTasks(): Promise<Task[]> {
        return this.taskRepo.findActive();
    }

    // Create a new task
    async createTask(actor: Actor, data: NewTask): Promise<Task> {
        if (actor.role !== 'admin') {
            throw new AuthorizationError('Access denied: Only admins can create tasks');
        }

        // Validate project exists
        const project = await this.projectRepo.findById(data.project_id);
        if (!project) {
            throw new InvalidReferenceError(`Project with ID ${data.project_id} not found`);
        }

        return this.taskRepo.create(data);
    }

    // Update a task
    async updateTask(actor: Actor, id: string, data: UpdateTask): Promise<Task> {
        if (actor.role !== 'admin') {
            throw new AuthorizationError('Access denied: Only admins can update tasks');
        }

        const task = await this.taskRepo.findById(id);
        if (!task) {
            throw new TaskNotFoundError(id);
        }

        if (data.project_id) {
            const project = await this.projectRepo.findById(data.project_id);
            if (!project) {
                throw new InvalidReferenceError(`Project with ID ${data.project_id} not found`);
            }
        }

        return this.taskRepo.update(id, data);
    }

    // Soft delete a task
    async deleteTask(actor: Actor, id: string): Promise<void> {
        if (actor.role !== 'admin') {
            throw new AuthorizationError('Access denied: Only admins can delete tasks');
        }

        const task = await this.taskRepo.findById(id);
        if (!task) {
            throw new TaskNotFoundError(id);
        }

        await this.taskRepo.delete(id);
    }

    // Soft delete tasks by project ID (Internal use for cascade)
    async deleteTasksByProjectId(projectId: string): Promise<void> {
        // Find all tasks for this project
        const tasks = await this.taskRepo.findByProjectId(projectId);

        // Soft delete each task
        // Note: In a real app we might want to do this in a batch or transaction
        for (const task of tasks) {
            await this.taskRepo.delete(task.task_id);
        }
    }
}
