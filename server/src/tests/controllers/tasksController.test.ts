
/**
 * Unit tests for tasks controller
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';

// Mock dependencies before importing
vi.mock('../../db/supabase.js', () => ({
    supabase: {
        from: vi.fn(),
    },
    supabaseAdmin: {
        from: vi.fn(),
    },
}));

// Mock TasksService
vi.mock('../../services/tasksService.js', () => {
    const mockListTasks = vi.fn();
    return {
        TasksService: vi.fn().mockImplementation(() => ({
            listTasks: mockListTasks,
        })),
        __mocks: {
            mockListTasks,
        },
    };
});

// Mock AssignmentsService
vi.mock('../../services/assignmentsService.js', () => {
    const mockGetAssignmentsByTaskId = vi.fn();
    const mockGetAllActiveAssignments = vi.fn();
    const mockAssignEmployees = vi.fn();
    return {
        AssignmentsService: vi.fn().mockImplementation(() => ({
            getAssignmentsByTaskId: mockGetAssignmentsByTaskId,
            getAllActiveAssignments: mockGetAllActiveAssignments,
            assignEmployees: mockAssignEmployees,
        })),
        __mocks: {
            mockGetAssignmentsByTaskId,
            mockGetAllActiveAssignments,
            mockAssignEmployees,
        },
    };
});

// Import after mocking
import {
    listTasks,
    getAssignments,
    getAllAssignments,
    assignEmployees,
} from '../../controllers/tasksController.js';

import type { DecodedToken } from '../../utils/jwt.js';

interface AuthenticatedRequest extends Request {
    user?: Partial<DecodedToken>;
}

// Get mocks
const tasksServiceModule = await vi.importMock<
    typeof import('../../services/tasksService.js')
>('../../services/tasksService.js');
const { mockListTasks } = (
    tasksServiceModule as unknown as {
        __mocks: Record<string, ReturnType<typeof vi.fn>>;
    }
).__mocks;

const assignmentsServiceModule = await vi.importMock<
    typeof import('../../services/assignmentsService.js')
>('../../services/assignmentsService.js');
const {
    mockGetAssignmentsByTaskId,
    mockGetAllActiveAssignments,
    mockAssignEmployees
} = (
    assignmentsServiceModule as unknown as {
        __mocks: Record<string, ReturnType<typeof vi.fn>>;
    }
).__mocks;

describe('TasksController', () => {
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
        };
    });

    describe('listTasks', () => {
        it('should list active tasks successfully', async () => {
            const mockTasks = [
                { task_id: 't1', name: 'Task 1', active: true },
                { task_id: 't2', name: 'Task 2', active: true },
            ];

            mockListTasks.mockResolvedValue(mockTasks);

            await listTasks(mockRequest as Request, mockResponse as Response);

            expect(mockListTasks).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: mockTasks,
            });
        });
    });

    describe('getAllAssignments', () => {
        it('should return all active assignments', async () => {
            const mockAssignments = [
                { admin_task_assignment_id: 'a1', task_id: 't1', user_id: 'u1' }
            ];
            mockGetAllActiveAssignments.mockResolvedValue(mockAssignments);

            await getAllAssignments(mockRequest as Request, mockResponse as Response);

            expect(mockGetAllActiveAssignments).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                data: mockAssignments
            });
        });
    });

    describe('assignEmployees', () => {
        it('should assign employees successfully', async () => {
            mockRequest.params = { taskId: 't1' };
            mockRequest.body = { employeeIds: ['u1', 'u2'] };

            mockAssignEmployees.mockResolvedValue(undefined);

            await assignEmployees(mockRequest as Request, mockResponse as Response);

            expect(mockAssignEmployees).toHaveBeenCalledWith(
                expect.objectContaining({ role: 'admin' }),
                'admin-id',
                't1',
                ['u1', 'u2']
            );
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                success: true,
                message: 'Assignments updated successfully'
            });
        });

        it('should return 400 if employeeIds is not an array', async () => {
            mockRequest.params = { taskId: 't1' };
            mockRequest.body = { employeeIds: 'not-an-array' };

            await assignEmployees(mockRequest as Request, mockResponse as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({
                success: false,
                error: expect.objectContaining({ code: 'VALIDATION_ERROR' })
            }));
        });
    });
});
