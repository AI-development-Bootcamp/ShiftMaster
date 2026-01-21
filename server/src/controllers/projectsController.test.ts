
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as projectsController from './projectsController';
import { AuthenticatedRequest } from '../types/express';
import { ProjectsService } from '../services/projectsService.js';

vi.mock('../services/projectsService.js');

const createMockService = () => ({
    listProjects: vi.fn(),
    createProject: vi.fn(),
    updateProject: vi.fn(),
    deleteProject: vi.fn(),
} as unknown as ProjectsService);

import { Response } from 'express';

const mockResponse = (): Partial<Response> & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> } => {
    const res: Partial<Response> & { status: ReturnType<typeof vi.fn>; json: ReturnType<typeof vi.fn> } = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
    };
    return res;
};

const mockUser = {
    user_id: 'user-123',
    role: 'admin',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '',
};

describe('ProjectsController', () => {
    let mockService: ReturnType<typeof createMockService>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockService = createMockService();
        vi.mocked(ProjectsService).mockImplementation(() => mockService);
    });

    describe('createProject', () => {
        it('should create a project successfully', async () => {
            const req = {
                body: {
                    name: 'Test Project',
                    client_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // UUID
                    manager_user_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
                    start_date: '2023-01-01'
                },
                user: mockUser
            } as unknown as AuthenticatedRequest;
            const res = mockResponse();

            const mockProject = { project_id: 'project-1', ...req.body, active: true, time_format_type: 'sum' };
            vi.mocked(mockService.createProject).mockResolvedValue(mockProject);

            await projectsController.createProject(req, res, undefined, mockService);

            expect(mockService.createProject).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }), { ...req.body, time_format_type: 'sum' });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockProject });
        });

        it('should return 400 if validation fails', async () => {
            const req = {
                body: { name: 'Test Project' }, // Missing client_id, start_date
                user: mockUser
            } as unknown as AuthenticatedRequest;
            const res = mockResponse();

            await projectsController.createProject(req, res, undefined, mockService);

            expect(mockService.createProject).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('updateProject', () => {
        it('should update a project successfully', async () => {
            const req = {
                params: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
                body: { name: 'Updated Project' },
                user: mockUser
            } as unknown as AuthenticatedRequest;
            const res = mockResponse();

            const mockProject = { project_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Updated Project', client_id: 'c1', start_date: '2023-01-01', active: true };
            vi.mocked(mockService.updateProject).mockResolvedValue(mockProject);

            await projectsController.updateProject(req, res, undefined, mockService);

            expect(mockService.updateProject).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', req.body);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockProject });
        });
    });

    describe('deleteProject', () => {
        it('should delete a project successfully', async () => {
            const req = {
                params: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
                user: mockUser
            } as unknown as AuthenticatedRequest;
            const res = mockResponse();

            vi.mocked(mockService.deleteProject).mockResolvedValue();

            await projectsController.deleteProject(req, res, undefined, mockService);

            expect(mockService.deleteProject).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: { message: expect.any(String) } });
        });
    });
});
