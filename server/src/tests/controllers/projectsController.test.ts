/**
 * Unit tests for projects controller
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// Mock dependencies
vi.mock('../../db/supabase.js', () => ({
    supabase: {},
    supabaseAdmin: {},
}));

vi.mock('../../db/repositories/ProjectRepository.js', () => ({
    ProjectRepository: vi.fn(),
}));

vi.mock('../../db/repositories/ClientRepository.js', () => ({
    ClientRepository: vi.fn(),
}));

vi.mock('../../db/repositories/UserRepository.js', () => ({
    UserRepository: vi.fn(),
}));

// Mock ProjectsService
vi.mock('../../services/projectsService.js', () => {
    const mockCreateProject = vi.fn();
    const mockListProjects = vi.fn();
    const mockGetProjectById = vi.fn();
    const mockUpdateProject = vi.fn();
    const mockDeleteProject = vi.fn();

    return {
        ProjectsService: vi.fn().mockImplementation(() => ({
            createProject: mockCreateProject,
            listProjects: mockListProjects,
            getProjectById: mockGetProjectById,
            updateProject: mockUpdateProject,
            deleteProject: mockDeleteProject,
        })),
        DuplicateProjectError: class DuplicateProjectError extends Error {
            code = 'DUPLICATE_PROJECT';
            constructor(name: string) { super(`Project ${name} exists`); }
        },
        ProjectNotFoundError: class ProjectNotFoundError extends Error {
            code = 'PROJECT_NOT_FOUND';
            constructor(id: string) { super(`Project ${id} not found`); }
        },
        AuthorizationError: class AuthorizationError extends Error {
            code = 'FORBIDDEN';
            constructor(message: string) { super(message); }
        },
        ClientNotFoundError: class ClientNotFoundError extends Error {
            code = 'CLIENT_NOT_FOUND';
            constructor(id: string) { super(`Client ${id} not found`); }
        },
        __mocks: {
            mockCreateProject,
            mockListProjects,
            mockGetProjectById,
            mockUpdateProject,
            mockDeleteProject,
        }
    };
});

// Mock UsersService for UserNotFoundError
vi.mock('../../services/usersService.js', () => ({
    UserNotFoundError: class UserNotFoundError extends Error {
        code = 'USER_NOT_FOUND';
        constructor(id: string) { super(`User ${id} not found`); }
    }
}));

// Import after mocking
import {
    createProject,
    listProjects,
    getProject,
    updateProject as _updateProject,
    deleteProject as _deleteProject
} from '../../controllers/projectsController.js';
import {
    DuplicateProjectError,
    ProjectNotFoundError,
    ClientNotFoundError
} from '../../services/projectsService.js';
import { UserNotFoundError } from '../../services/usersService.js';

// Get mocks
const projectsServiceModule = await vi.importMock<typeof import('../../services/projectsService.js')>('../../services/projectsService.js');
const {
    mockCreateProject,
    mockListProjects,
    mockGetProjectById,
    mockUpdateProject: _mockUpdateProject,
    mockDeleteProject: _mockDeleteProject
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
} = (projectsServiceModule as any).__mocks;

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        role: 'admin' | 'regular';
        email: string;
        iat: number;
        exp: number;
    };
}

describe('ProjectsController', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonMock: ReturnType<typeof vi.fn>;
    let statusMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();

        mockRequest = {
            body: {},
            params: {},
            query: {},
        };

        jsonMock = vi.fn();
        statusMock = vi.fn().mockReturnValue({ json: jsonMock });

        mockResponse = {
            status: statusMock,
            json: jsonMock,
        };

        (mockRequest as AuthenticatedRequest).user = {
            userId: 'admin-id',
            role: 'admin',
            email: 'admin@example.com',
            iat: 1234567890,
            exp: 1234567890 + 3600
        };
    });

    describe('createProject', () => {
        it('should create project successfully', async () => {
            const projectData = {
                client_id: '123e4567-e89b-12d3-a456-426614174000',
                manager_user_id: '123e4567-e89b-12d3-a456-426614174002',
                name: 'New Project',
                time_format_type: 'start_end',
                start_date: '2024-01-01',
            };
            mockRequest.body = projectData;

            const createdProject = { ...projectData, project_id: 'new-id' };
            mockCreateProject.mockResolvedValue(createdProject);

            await createProject(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: { project: createdProject }
            });
        });

        it('should return 400 for duplicate project', async () => {
            mockRequest.body = {
                client_id: '123e4567-e89b-12d3-a456-426614174000',
                manager_user_id: '123e4567-e89b-12d3-a456-426614174002',
                name: 'Duplicate',
                time_format_type: 'sum',
                start_date: '2024-01-01',
            };
            mockCreateProject.mockRejectedValue(new DuplicateProjectError('Duplicate'));

            await createProject(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                error: expect.objectContaining({ code: 'DUPLICATE_PROJECT' })
            }));
        });

        it('should return 400 if client not found', async () => {
            mockRequest.body = {
                client_id: '123e4567-e89b-12d3-a456-426614174000',
                manager_user_id: '123e4567-e89b-12d3-a456-426614174002',
                name: 'Project',
                time_format_type: 'sum',
                start_date: '2024-01-01',
            };
            mockCreateProject.mockRejectedValue(new ClientNotFoundError('id'));

            await createProject(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                error: expect.objectContaining({ code: 'INVALID_REFERENCE' })
            }));
        });

        it('should return 400 if manager user not found', async () => {
            mockRequest.body = {
                client_id: '123e4567-e89b-12d3-a456-426614174000',
                manager_user_id: '123e4567-e89b-12d3-a456-426614174002',
                name: 'Project',
                time_format_type: 'sum',
                start_date: '2024-01-01',
            };
            mockCreateProject.mockRejectedValue(new UserNotFoundError('id'));

            await createProject(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                error: expect.objectContaining({ code: 'INVALID_REFERENCE' })
            }));
        });
    });

    describe('getProject', () => {
        it('should return project', async () => {
            mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174001' };
            const mockProject = { project_id: '123e4567-e89b-12d3-a456-426614174001', name: 'P1' };
            mockGetProjectById.mockResolvedValue(mockProject);

            await getProject(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: { project: mockProject }
            });
        });

        it('should return 404 if not found', async () => {
            mockRequest.params = { id: '123e4567-e89b-12d3-a456-426614174001' };
            mockGetProjectById.mockRejectedValue(new ProjectNotFoundError('id'));

            await getProject(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
        });
    });

    describe('listProjects', () => {
        it('should list projects', async () => {
            mockRequest.query = {};
            mockListProjects.mockResolvedValue({ data: [], count: 0 });

            await listProjects(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
        });
    });
});
