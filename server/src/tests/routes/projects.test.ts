/**
 * Integration tests for projects routes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

// Mock dependencies
vi.mock('../../db/supabase.js', () => ({
    supabase: {},
    supabaseAdmin: {},
}));

vi.mock('../../db/repositories/ProjectRepository.js', () => ({
    ProjectRepository: vi.fn(),
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
        __mocks: {
            mockCreateProject,
            mockListProjects,
            mockGetProjectById,
            mockUpdateProject,
            mockDeleteProject,
        }
    };
});

// Mock JWT
vi.mock('../../utils/jwt.js', () => ({
    verifyToken: vi.fn(),
    generateToken: vi.fn(),
}));

import projectsRouter from '../../routes/projects.js';
import * as jwtUtil from '../../utils/jwt.js';

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

// App setup
const app = express();
app.use(express.json());
app.use('/api/v1/projects', projectsRouter);

const VALID_ADMIN_TOKEN = 'valid.admin.token';
const VALID_USER_TOKEN = 'valid.user.token';

const mockAdminUser = { userId: 'admin-id', role: 'admin' as const, email: 'admin@example.com', iat: 123, exp: 456 };
const mockRegularUser = { userId: 'user-id', role: 'regular' as const, email: 'user@example.com', iat: 123, exp: 456 };

describe('Projects Routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('POST /projects', () => {
        it('should create project', async () => {
            vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
            const projectData = {
                client_id: '123e4567-e89b-12d3-a456-426614174000',
                manager_user_id: '123e4567-e89b-12d3-a456-426614174002',
                name: 'New Project',
                time_format_type: 'sum',
                start_date: '2024-01-01',
            };
            mockCreateProject.mockResolvedValue({ ...projectData, project_id: 'new-id' });

            const res = await request(app)
                .post('/api/v1/projects')
                .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`)
                .send(projectData);

            expect(res.status).toBe(201);
            expect(res.body.data.project.project_id).toBe('new-id');
        });

        it('should return 400 validation error', async () => {
            vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockAdminUser);
            const res = await request(app)
                .post('/api/v1/projects')
                .set('Authorization', `Bearer ${VALID_ADMIN_TOKEN}`)
                .send({}); // Missing fields
            expect(res.status).toBe(400);
        });
    });

    describe('GET /projects', () => {
        it('should list projects', async () => {
            vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockRegularUser);
            mockListProjects.mockResolvedValue({ data: [], count: 0 });

            const res = await request(app)
                .get('/api/v1/projects')
                .set('Authorization', `Bearer ${VALID_USER_TOKEN}`);

            expect(res.status).toBe(200);
        });
    });

    describe('GET /projects/:id', () => {
        it('should get project', async () => {
            vi.spyOn(jwtUtil, 'verifyToken').mockReturnValue(mockRegularUser);
            mockGetProjectById.mockResolvedValue({ project_id: 'pid', name: 'Project' });

            const res = await request(app)
                .get('/api/v1/projects/e58ed763-928c-4155-bee9-fdbaaadc15f3')
                .set('Authorization', `Bearer ${VALID_USER_TOKEN}`);

            expect(res.status).toBe(200);
        });
    });
});
