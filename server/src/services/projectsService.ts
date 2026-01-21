import { IProjectRepository, IClientRepository, IUserRepository } from '../db/types/repositories.js';
import { Project, NewProject, UpdateProject } from '../db/types/entities.js';
import { UserNotFoundError } from './usersService.js';

export class ProjectNotFoundError extends Error {
    code = 'PROJECT_NOT_FOUND';
    constructor() {
        super(`Project not found`);
    }
}

export class ClientNotFoundError extends Error {
    code = 'CLIENT_NOT_FOUND';
    constructor() {
        super(`Client not found`);
    }
}

export class DuplicateProjectError extends Error {
    code = 'DUPLICATE_PROJECT';
    constructor() {
        super(`Project name already exists`);
    }
}

export class AuthorizationError extends Error {
    code = 'FORBIDDEN';
    constructor(message: string = 'Access denied') {
        super(message);
    }
}

interface Actor {
    role: 'admin' | 'regular';
    userId?: string;
}

export class ProjectsService {
    constructor(
        private projectRepo: IProjectRepository,
        private clientRepo: IClientRepository,
        private userRepo: IUserRepository
    ) { }

    async createProject(actor: Actor, data: NewProject): Promise<Project> {
        // Only admins can create projects
        if (actor.role !== 'admin') {
            throw new AuthorizationError('Only admins can create projects');
        }

        try {
            // Validate Client existence
            const client = await this.clientRepo.findById(data.client_id);
            if (!client) {
                throw new ClientNotFoundError();
            }

            // Validate Manager User existence
            const manager = await this.userRepo.findById(data.manager_user_id);
            if (!manager) {
                throw new UserNotFoundError();
            }

            // Check for duplicate name
            // We search for exact match (case insensitive handles by DB/logic or here)
            // findPaginated uses ilike, so we filter results to be sure
            const { data: existing } = await this.projectRepo.findPaginated(1, 10, data.name, 'asc', true);

            if (existing.some(p => p.name.toLowerCase() === data.name.toLowerCase())) {
                throw new DuplicateProjectError();
            }

            return await this.projectRepo.create(data);
        } catch (error) {
            if (error instanceof DuplicateProjectError) throw error;
            if (error instanceof ClientNotFoundError) throw error;
            if (error instanceof UserNotFoundError) throw error;
            throw error;
        }
    }

    async listProjects(
        _actor: Actor,
        page: number = 1,
        limit: number = 20,
        search?: string,
        sort: 'asc' | 'desc' = 'asc',
        includeInactive: boolean = false
    ) {
        // All authenticated users can list projects
        return await this.projectRepo.findPaginated(page, limit, search, sort, includeInactive);
    }

    async getProjectById(_actor: Actor, id: string): Promise<Project> {
        const project = await this.projectRepo.findById(id);
        if (!project) throw new ProjectNotFoundError();
        return project;
    }

    async updateProject(actor: Actor, id: string, data: UpdateProject): Promise<Project> {
        const project = await this.projectRepo.findById(id);
        if (!project) throw new ProjectNotFoundError();

        // Admins or the Project Manager can update
        if (actor.role !== 'admin' && project.manager_user_id !== actor.userId) {
            throw new AuthorizationError('Only admins or the project manager can update this project');
        }

        try {
            // Validate Client existence if updating client_id
            if (data.client_id) {
                const client = await this.clientRepo.findById(data.client_id);
                if (!client) {
                    throw new ClientNotFoundError();
                }
            }

            // Validate Manager User existence if updating manager_user_id
            if (data.manager_user_id) {
                const manager = await this.userRepo.findById(data.manager_user_id);
                if (!manager) {
                    throw new UserNotFoundError();
                }
            }

            // Check for duplicate name if name is changing
            if (data.name && data.name.toLowerCase() !== project.name.toLowerCase()) {
                const newName = data.name;
                const { data: existing } = await this.projectRepo.findPaginated(1, 10, newName, 'asc', true);
                if (existing.some(p => p.name.toLowerCase() === newName.toLowerCase() && p.project_id !== id)) {
                    throw new DuplicateProjectError();
                }
            }

            return await this.projectRepo.update(id, data);
        } catch (error) {
            if (error instanceof DuplicateProjectError) throw error;
            if (error instanceof ClientNotFoundError) throw error;
            if (error instanceof UserNotFoundError) throw error;
            throw error;
        }
    }

    async deleteProject(actor: Actor, id: string): Promise<void> {
        if (actor.role !== 'admin') {
            throw new AuthorizationError('Only admins can delete projects');
        }

        const project = await this.projectRepo.findById(id);
        if (!project) throw new ProjectNotFoundError();

        // Soft delete
        await this.projectRepo.update(id, { active: false });
    }
}
