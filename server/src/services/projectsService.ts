import { SupabaseClient } from '@supabase/supabase-js';
import { ProjectRepository } from '../db/repositories/ProjectRepository.js';
import { ClientRepository } from '../db/repositories/ClientRepository.js';
import { UserRepository } from '../db/repositories/UserRepository.js';
import { Project, NewProject, UpdateProject } from '../db/types/entities.js';
import { Actor, AuthorizationError } from './usersService.js';
import { TasksService } from './tasksService.js';

export class ProjectNotFoundError extends Error {
    code = 'PROJECT_NOT_FOUND';
    constructor(projectId: string) {
        super(`Project with ID ${projectId} not found`);
        this.name = 'ProjectNotFoundError';
    }
}

export class InvalidReferenceError extends Error {
    code = 'INVALID_REFERENCE';
    constructor(message: string) {
        super(message);
        this.name = 'InvalidReferenceError';
    }
}

export class ProjectsService {
    private projectRepo: ProjectRepository;
    private clientRepo: ClientRepository;
    private userRepo: UserRepository;
    private tasksService: TasksService;

    constructor(client: SupabaseClient) {
        this.projectRepo = new ProjectRepository(client);
        this.clientRepo = new ClientRepository(client);
        this.userRepo = new UserRepository(client);
        this.tasksService = new TasksService(client);
    }

    async listProjects(includeInactive = false): Promise<Project[]> {
        if (includeInactive) {
            return this.projectRepo.findAll();
        }
        return this.projectRepo.findActive();
    }

    // Create a new project
    async createProject(actor: Actor, data: NewProject): Promise<Project> {
        if (actor.role !== 'admin') {
            throw new AuthorizationError('Access denied: Only admins can create projects');
        }

        // Validate client exists
        const client = await this.clientRepo.findById(data.client_id);
        if (!client) {
            throw new InvalidReferenceError(`Client with ID ${data.client_id} not found`);
        }

        // Validate manager exists
        if (data.manager_user_id) {
            const manager = await this.userRepo.findById(data.manager_user_id);
            if (!manager) {
                throw new InvalidReferenceError(`Manager with ID ${data.manager_user_id} not found`);
            }
        }

        // Default time_format_type to 'sum' if not provided
        const projectData = {
            ...data,
            time_format_type: data.time_format_type || 'sum'
        };

        return this.projectRepo.create(projectData as NewProject);
    }

    // Update a project
    async updateProject(actor: Actor, id: string, data: UpdateProject): Promise<Project> {
        if (actor.role !== 'admin') {
            throw new AuthorizationError('Access denied: Only admins can update projects');
        }

        const project = await this.projectRepo.findById(id);
        if (!project) {
            throw new ProjectNotFoundError(id);
        }

        if (data.client_id) {
            const client = await this.clientRepo.findById(data.client_id);
            if (!client) {
                throw new InvalidReferenceError(`Client with ID ${data.client_id} not found`);
            }
        }

        if (data.manager_user_id) {
            const manager = await this.userRepo.findById(data.manager_user_id);
            if (!manager) {
                throw new InvalidReferenceError(`Manager with ID ${data.manager_user_id} not found`);
            }
        }

        return this.projectRepo.update(id, data);
    }

    // Soft delete a project
    async deleteProject(actor: Actor, id: string): Promise<void> {
        if (actor.role !== 'admin') {
            throw new AuthorizationError('Access denied: Only admins can delete projects');
        }

        const project = await this.projectRepo.findById(id);
        if (!project) {
            throw new ProjectNotFoundError(id);
        }

        // Cascade delete tasks
        await this.tasksService.deleteTasksByProjectId(id);

        // Delete project
        await this.projectRepo.delete(id);
    }

    // Soft delete projects by client ID (Internal use for cascade)
    async deleteProjectsByClientId(clientId: string): Promise<void> {
        // Find all projects for this client
        const projects = await this.projectRepo.findByClientId(clientId);

        // Soft delete each project and its tasks
        for (const project of projects) {
            // We can reuse deleteProject logic but we need to bypass admin check or mock actor?
            // Since this is internal service-to-service call, we should just run the logic directly.
            // But we need to invoke cascade for tasks too.

            await this.tasksService.deleteTasksByProjectId(project.project_id);
            await this.projectRepo.delete(project.project_id);
        }
    }
}
