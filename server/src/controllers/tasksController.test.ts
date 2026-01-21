
import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as tasksController from './tasksController';
import { AuthenticatedRequest } from '../types/express';
import { TasksService } from '../services/tasksService.js';

vi.mock('../services/tasksService.js');

const createMockService = () => ({
    fetchTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    fetchAdminTaskAssignments: vi.fn(),
    assignEmployeesToTask: vi.fn(),
    fetchAssignmentsByTaskId: vi.fn(),
    listTasks: vi.fn(),
} as unknown as TasksService);

import { Response } from 'express';

const mockResponse = () => {
    const res = {} as unknown as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
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

describe('TasksController', () => {
    let mockService: ReturnType<typeof createMockService>;

    beforeEach(() => {
        vi.clearAllMocks();
        mockService = createMockService();
        vi.mocked(TasksService).mockImplementation(() => mockService);
    });

    describe('createTask', () => {
        it('should create a task successfully', async () => {
            const req = {
                body: { name: 'Test Task', project_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
                user: mockUser
            } as unknown as AuthenticatedRequest;
            const res = mockResponse();

            const mockTask = { task_id: 'task-1', ...req.body, active: true };
            vi.mocked(mockService.createTask).mockResolvedValue(mockTask);

            await tasksController.createTask(req, res, undefined, mockService);

            expect(mockService.createTask).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }), req.body);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockTask });
        });

        it('should return 400 if validation fails', async () => {
            const req = {
                body: { project_id: 'project-1' }, // Missing name
                user: mockUser
            } as unknown as AuthenticatedRequest;
            const res = mockResponse();

            await tasksController.createTask(req, res, undefined, mockService);

            expect(mockService.createTask).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('updateTask', () => {
        it('should update a task successfully', async () => {
            const req = {
                params: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
                body: { name: 'Updated Task' },
                user: mockUser
            } as unknown as AuthenticatedRequest;
            const res = mockResponse();

            const mockTask = { task_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Updated Task', project_id: 'p1', active: true };
            vi.mocked(mockService.updateTask).mockResolvedValue(mockTask);

            await tasksController.updateTask(req, res, undefined, mockService);

            expect(mockService.updateTask).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', req.body);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockTask });
        });
    });

    describe('deleteTask', () => {
        it('should delete a task successfully', async () => {
            const req = {
                params: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
                user: mockUser
            } as unknown as AuthenticatedRequest;
            const res = mockResponse();

            vi.mocked(mockService.deleteTask).mockResolvedValue(undefined);

            await tasksController.deleteTask(req, res, undefined, mockService);

            expect(mockService.deleteTask).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: { message: expect.any(String) } });
        });
    });
});
