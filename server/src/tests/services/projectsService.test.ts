/**
 * Tests for ProjectsService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    ProjectsService,
    DuplicateProjectError,
    ProjectNotFoundError,
    AuthorizationError,
    ClientNotFoundError
} from '../../services/projectsService.js';
import { UserNotFoundError } from '../../services/usersService.js';
import { Project } from '../../db/types/entities.js';
import { IProjectRepository, IClientRepository, IUserRepository } from '../../db/types/repositories.js';

describe('ProjectsService', () => {
    let projectsService: ProjectsService;
    let mockProjectRepo: {
        create: ReturnType<typeof vi.fn>;
        findById: ReturnType<typeof vi.fn>;
        findPaginated: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
    };
    let mockClientRepo: {
        findById: ReturnType<typeof vi.fn>;
        // other methods if needed
    };
    let mockUserRepo: {
        findById: ReturnType<typeof vi.fn>;
        // other methods if needed
    };

    const mockProject: Project = {
        project_id: '123e4567-e89b-12d3-a456-426614174001',
        client_id: '123e4567-e89b-12d3-a456-426614174000',
        manager_user_id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Website Redesign',
        description: 'Complete overhaul',
        start_date: '2024-01-01',
        end_date: '2024-06-30',
        time_format_type: 'start_end',
        active: true,
        created_at: '2024-01-01T00:00:00Z',
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockProjectRepo = {
            create: vi.fn(),
            findById: vi.fn(),
            findPaginated: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        mockClientRepo = {
            findById: vi.fn(),
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        mockUserRepo = {
            findById: vi.fn(),
        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any

        projectsService = new ProjectsService(
            mockProjectRepo as unknown as IProjectRepository,
            mockClientRepo as unknown as IClientRepository,
            mockUserRepo as unknown as IUserRepository
        );
    });

    describe('createProject', () => {
        const newProjectData = {
            client_id: mockProject.client_id,
            manager_user_id: mockProject.manager_user_id,
            name: 'New Project',
            time_format_type: 'sum' as const,
            start_date: '2024-02-01',
        };

        it('should create project successfully when admin and references exist', async () => {
            mockProjectRepo.findPaginated.mockResolvedValue({ data: [], count: 0 }); // No duplicates
            mockProjectRepo.create.mockResolvedValue({ ...mockProject, ...newProjectData });
            mockClientRepo.findById.mockResolvedValue({ client_id: newProjectData.client_id }); // Client exists
            mockUserRepo.findById.mockResolvedValue({ user_id: newProjectData.manager_user_id }); // Manager exists

            const actor = { role: 'admin' as const, userId: 'admin-id' };
            const result = await projectsService.createProject(actor, newProjectData);

            expect(mockClientRepo.findById).toHaveBeenCalledWith(newProjectData.client_id);
            expect(mockUserRepo.findById).toHaveBeenCalledWith(newProjectData.manager_user_id);
            expect(mockProjectRepo.findPaginated).toHaveBeenCalledWith(1, 10, newProjectData.name, 'asc', true);
            expect(mockProjectRepo.create).toHaveBeenCalledWith(newProjectData);
            expect(result.name).toBe(newProjectData.name);
        });

        it('should throw ClientNotFoundError if client does not exist', async () => {
            mockClientRepo.findById.mockResolvedValue(null);

            const actor = { role: 'admin' as const, userId: 'admin-id' };
            await expect(projectsService.createProject(actor, newProjectData))
                .rejects.toThrow(ClientNotFoundError);

            expect(mockClientRepo.findById).toHaveBeenCalledWith(newProjectData.client_id);
            expect(mockProjectRepo.create).not.toHaveBeenCalled();
        });

        it('should throw UserNotFoundError if manager user does not exist', async () => {
            mockClientRepo.findById.mockResolvedValue({ client_id: newProjectData.client_id });
            mockUserRepo.findById.mockResolvedValue(null);

            const actor = { role: 'admin' as const, userId: 'admin-id' };
            await expect(projectsService.createProject(actor, newProjectData))
                .rejects.toThrow(UserNotFoundError);

            expect(mockUserRepo.findById).toHaveBeenCalledWith(newProjectData.manager_user_id);
            expect(mockProjectRepo.create).not.toHaveBeenCalled();
        });

        it('should throw AuthorizationError if not admin', async () => {
            const actor = { role: 'regular' as const, userId: 'user-id' };
            await expect(projectsService.createProject(actor, newProjectData))
                .rejects.toThrow(AuthorizationError);
            expect(mockProjectRepo.create).not.toHaveBeenCalled();
        });

        it('should throw DuplicateProjectError if name exists', async () => {
            mockClientRepo.findById.mockResolvedValue({ client_id: newProjectData.client_id });
            mockUserRepo.findById.mockResolvedValue({ user_id: newProjectData.manager_user_id });
            mockProjectRepo.findPaginated.mockResolvedValue({
                data: [{ ...mockProject, name: newProjectData.name }],
                count: 1
            });

            const actor = { role: 'admin' as const, userId: 'admin-id' };
            await expect(projectsService.createProject(actor, newProjectData))
                .rejects.toThrow(DuplicateProjectError);
            expect(mockProjectRepo.create).not.toHaveBeenCalled();
        });
    });

    describe('listProjects', () => {
        it('should list projects', async () => {
            mockProjectRepo.findPaginated.mockResolvedValue({ data: [mockProject], count: 1 });

            const actor = { role: 'regular' as const, userId: 'user-id' };
            const result = await projectsService.listProjects(actor);

            expect(mockProjectRepo.findPaginated).toHaveBeenCalledWith(1, 20, undefined, 'asc', false);
            expect(result.data).toHaveLength(1);
        });
    });

    describe('getProjectById', () => {
        it('should return project', async () => {
            mockProjectRepo.findById.mockResolvedValue(mockProject);

            const actor = { role: 'regular' as const, userId: 'user-id' };
            const result = await projectsService.getProjectById(actor, mockProject.project_id);

            expect(result).toEqual(mockProject);
        });

        it('should throw ProjectNotFoundError', async () => {
            mockProjectRepo.findById.mockResolvedValue(null);

            const actor = { role: 'regular' as const, userId: 'user-id' };
            await expect(projectsService.getProjectById(actor, 'missing-id'))
                .rejects.toThrow(ProjectNotFoundError);
        });
    });

    describe('updateProject', () => {
        const updates = { name: 'Updated Name' };

        it('should update project if admin', async () => {
            mockProjectRepo.findById.mockResolvedValue(mockProject);
            mockProjectRepo.findPaginated.mockResolvedValue({ data: [], count: 0 }); // No duplicates
            mockProjectRepo.update.mockResolvedValue({ ...mockProject, ...updates });

            const actor = { role: 'admin' as const, userId: 'admin-id' };
            await projectsService.updateProject(actor, mockProject.project_id, updates);

            expect(mockProjectRepo.update).toHaveBeenCalledWith(mockProject.project_id, updates);
        });

        it('should update project if manager', async () => {
            mockProjectRepo.findById.mockResolvedValue(mockProject); // manager is '123e4567-e89b-12d3-a456-426614174002'
            mockProjectRepo.findPaginated.mockResolvedValue({ data: [], count: 0 }); // No duplicates
            mockProjectRepo.update.mockResolvedValue({ ...mockProject, ...updates });

            const actor = { role: 'regular' as const, userId: mockProject.manager_user_id };
            await projectsService.updateProject(actor, mockProject.project_id, updates);

            expect(mockProjectRepo.update).toHaveBeenCalled();
        });

        it('should throw AuthorizationError if not admin or manager', async () => {
            mockProjectRepo.findById.mockResolvedValue(mockProject);

            const actor = { role: 'regular' as const, userId: 'other-user' };
            await expect(projectsService.updateProject(actor, mockProject.project_id, updates))
                .rejects.toThrow(AuthorizationError);
        });

        it('should throw ClientNotFoundError if updated client does not exist', async () => {
            mockProjectRepo.findById.mockResolvedValue(mockProject);
            mockClientRepo.findById.mockResolvedValue(null);

            const actor = { role: 'admin' as const, userId: 'admin-id' };
            await expect(projectsService.updateProject(actor, mockProject.project_id, { client_id: '123e4567-e89b-12d3-a456-426614174099' }))
                .rejects.toThrow(ClientNotFoundError);
        });

        it('should throw UserNotFoundError if updated manager does not exist', async () => {
            mockProjectRepo.findById.mockResolvedValue(mockProject);
            mockUserRepo.findById.mockResolvedValue(null);

            const actor = { role: 'admin' as const, userId: 'admin-id' };
            await expect(projectsService.updateProject(actor, mockProject.project_id, { manager_user_id: '123e4567-e89b-12d3-a456-426614174099' }))
                .rejects.toThrow(UserNotFoundError);
        });

        it('should throw DuplicateProjectError if updated name exists', async () => {
            mockProjectRepo.findById.mockResolvedValue(mockProject);
            mockProjectRepo.findPaginated.mockResolvedValue({
                data: [{ ...mockProject, project_id: 'different-id', name: 'Existing Name' }],
                count: 1
            });

            const actor = { role: 'admin' as const, userId: 'admin-id' };
            await expect(projectsService.updateProject(actor, mockProject.project_id, { name: 'Existing Name' }))
                .rejects.toThrow(DuplicateProjectError);
        });

        it('should NOT throw DuplicateProjectError if name is same case-insensitive', async () => {
            mockProjectRepo.findById.mockResolvedValue(mockProject);
            mockProjectRepo.update.mockResolvedValue({ ...mockProject });

            const actor = { role: 'admin' as const, userId: 'admin-id' };
            // Same name as mockProject.name ('Website Redesign')
            await projectsService.updateProject(actor, mockProject.project_id, { name: 'website redesign' });

            expect(mockProjectRepo.update).toHaveBeenCalled();
            expect(mockProjectRepo.findPaginated).not.toHaveBeenCalled(); // Should assume check skipped or returns empty
        });
    });

    describe('deleteProject', () => {
        it('should soft delete project if admin', async () => {
            mockProjectRepo.findById.mockResolvedValue(mockProject);
            mockProjectRepo.update.mockResolvedValue({ ...mockProject, active: false });

            const actor = { role: 'admin' as const, userId: 'admin-id' };
            await projectsService.deleteProject(actor, mockProject.project_id);

            expect(mockProjectRepo.update).toHaveBeenCalledWith(mockProject.project_id, { active: false });
        });

        it('should throw AuthorizationError if not admin', async () => {
            const actor = { role: 'regular' as const, userId: 'user-id' };
            await expect(projectsService.deleteProject(actor, mockProject.project_id))
                .rejects.toThrow(AuthorizationError);
        });
    });
});
