
/**
 * Unit tests for tasks controller
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response } from 'express';
import type { DecodedToken } from '../../utils/jwt.js';

interface AuthenticatedRequest extends Request {
  user?: Partial<DecodedToken>;
}

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
  const mockCreateTask = vi.fn();
  const mockUpdateTask = vi.fn();
  const mockDeleteTask = vi.fn();
  const mockFetchTasks = vi.fn();
  const mockFetchAdminTaskAssignments = vi.fn();
  const mockAssignEmployeesToTask = vi.fn();
  const mockFetchAssignmentsByTaskId = vi.fn();
  return {
    TasksService: vi.fn().mockImplementation(() => ({
      listTasks: mockListTasks,
      createTask: mockCreateTask,
      updateTask: mockUpdateTask,
      deleteTask: mockDeleteTask,
      fetchTasks: mockFetchTasks,
      fetchAdminTaskAssignments: mockFetchAdminTaskAssignments,
      assignEmployeesToTask: mockAssignEmployeesToTask,
      fetchAssignmentsByTaskId: mockFetchAssignmentsByTaskId,
    })),
    __mocks: {
      mockListTasks,
      mockCreateTask,
      mockUpdateTask,
      mockDeleteTask,
      mockFetchTasks,
      mockFetchAdminTaskAssignments,
      mockAssignEmployeesToTask,
      mockFetchAssignmentsByTaskId,
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
  createTask,
  updateTask,
  deleteTask,
  getAssignments as _getAssignments,
  getAllAssignments,
  assignEmployees,
} from '../../controllers/tasksController.js';
import { TasksService } from '../../services/tasksService.js';

// Get mocks
const tasksServiceModule = await vi.importMock<
  typeof import('../../services/tasksService.js')
>('../../services/tasksService.js');
const {
  mockListTasks,
  mockCreateTask,
  mockUpdateTask,
  mockDeleteTask,

} = (
  tasksServiceModule as unknown as {
    __mocks: Record<string, ReturnType<typeof vi.fn>>;
  }
).__mocks;

const assignmentsServiceModule = await vi.importMock<
  typeof import('../../services/assignmentsService.js')
>('../../services/assignmentsService.js');
const {
  mockGetAssignmentsByTaskId: _mockGetAssignmentsByTaskId,
  mockGetAllActiveAssignments,
  mockAssignEmployees: mockAssignEmployeesService,
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
  let mockService: ReturnType<typeof TasksService>;

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

    mockService = new TasksService();
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

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const req = {
        body: { name: 'Test Task', project_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
        user: {
          userId: 'user-123',
          role: 'admin',
          email: 'admin@example.com',
        },
      } as unknown as AuthenticatedRequest;
      const res = mockResponse as Response;

      const mockTask = { task_id: 'task-1', ...req.body, active: true };
      mockCreateTask.mockResolvedValue(mockTask);

      await createTask(req as Request, res, undefined, mockService);

      expect(mockCreateTask).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }), req.body);
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({ success: true, data: mockTask });
    });

    it('should return 400 if validation fails', async () => {
      const req = {
        body: { project_id: 'project-1' }, // Missing name
        user: {
          userId: 'user-123',
          role: 'admin',
          email: 'admin@example.com',
        },
      } as unknown as AuthenticatedRequest;
      const res = mockResponse as Response;

      await createTask(req as Request, res, undefined, mockService);

      expect(mockCreateTask).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const req = {
        params: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
        body: { name: 'Updated Task' },
        user: {
          userId: 'user-123',
          role: 'admin',
          email: 'admin@example.com',
        },
      } as unknown as AuthenticatedRequest;
      const res = mockResponse as Response;

      const mockTask = { task_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Updated Task', project_id: 'p1', active: true };
      mockUpdateTask.mockResolvedValue(mockTask);

      await updateTask(req as Request, res, undefined, mockService);

      expect(mockUpdateTask).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', req.body);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ success: true, data: mockTask });
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      const req = {
        params: { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
        user: {
          userId: 'user-123',
          role: 'admin',
          email: 'admin@example.com',
        },
      } as unknown as AuthenticatedRequest;
      const res = mockResponse as Response;

      mockDeleteTask.mockResolvedValue(undefined);

      await deleteTask(req as Request, res, undefined, mockService);

      expect(mockDeleteTask).toHaveBeenCalledWith(expect.objectContaining({ role: 'admin' }), 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({ success: true, data: { message: expect.any(String) } });
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

      mockAssignEmployeesService.mockResolvedValue(undefined);

      await assignEmployees(mockRequest as Request, mockResponse as Response);

      expect(mockAssignEmployeesService).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'admin' }),
        'admin-id',
        't1',
        ['u1', 'u2']
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          message: 'Assignments updated successfully'
        }
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
