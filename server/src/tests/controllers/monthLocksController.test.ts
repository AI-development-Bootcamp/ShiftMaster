/**
 * Unit tests for month locks controller
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

// Mock the MonthLocksService class
vi.mock('../../services/monthLocksService.js', () => {
  const mockGetLocksForYear = vi.fn();
  const mockBatchUpdate = vi.fn();

  return {
    MonthLocksService: vi.fn().mockImplementation(() => ({
      getLocksForYear: mockGetLocksForYear,
      batchUpdate: mockBatchUpdate,
    })),
    MonthAlreadyLockedError: class MonthAlreadyLockedError extends Error {
      code = 'MONTH_ALREADY_LOCKED';
      constructor(year: number, month: number) {
        super(`Month ${month} of year ${year} is already locked`);
      }
    },
    MonthNotLockedError: class MonthNotLockedError extends Error {
      code = 'MONTH_NOT_LOCKED';
      constructor(year: number, month: number) {
        super(`Month ${month} of year ${year} is not locked`);
      }
    },
    __mocks: {
      mockGetLocksForYear,
      mockBatchUpdate,
    },
  };
});

// Import after mocking
import {
  listLocks,
  batchUpdateLocks,
} from '../../controllers/monthLocksController.js';
import type { DecodedToken } from '../../utils/jwt.js';

interface AuthenticatedRequest extends Request {
  user?: Partial<DecodedToken>;
}

// Get mocks from the mocked module
const monthLocksServiceModule = await vi.importMock<
  typeof import('../../services/monthLocksService.js')
>('../../services/monthLocksService.js');
const { mockGetLocksForYear, mockBatchUpdate } = (
  monthLocksServiceModule as unknown as {
    __mocks: Record<string, ReturnType<typeof vi.fn>>;
  }
).__mocks;

describe('MonthLocksController', () => {
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
      userId: 'admin-user-id',
      role: 'admin',
      email: 'admin@example.com',
    };
  });

  describe('listLocks', () => {
    it('should return locks for a specific year', async () => {
      const mockLocks = [
        {
          lock_id: '123e4567-e89b-12d3-a456-426614174000',
          year: 2026,
          month: 1,
          locked_at: '2026-02-05T09:00:00Z',
          locked_by: 'admin-user-id',
          unlocked_at: null,
        },
        {
          lock_id: '223e4567-e89b-12d3-a456-426614174001',
          year: 2026,
          month: 2,
          locked_at: '2026-03-05T09:00:00Z',
          locked_by: 'admin-user-id',
          unlocked_at: null,
        },
      ];

      mockRequest.query = { year: '2026' };
      mockGetLocksForYear.mockResolvedValue(mockLocks);

      await listLocks(mockRequest as Request, mockResponse as Response);

      expect(mockGetLocksForYear).toHaveBeenCalledWith(2026);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          locks: mockLocks,
        },
      });
    });

    it('should return empty array when no locks exist for the year', async () => {
      mockRequest.query = { year: '2025' };
      mockGetLocksForYear.mockResolvedValue([]);

      await listLocks(mockRequest as Request, mockResponse as Response);

      expect(mockGetLocksForYear).toHaveBeenCalledWith(2025);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          locks: [],
        },
      });
    });

    it('should allow regular users to view locks', async () => {
      const mockLocks = [
        {
          lock_id: '123e4567-e89b-12d3-a456-426614174000',
          year: 2026,
          month: 1,
          locked_at: '2026-02-05T09:00:00Z',
          locked_by: 'admin-user-id',
          unlocked_at: null,
        },
      ];

      mockRequest.query = { year: '2026' };
      (mockRequest as AuthenticatedRequest).user = {
        userId: 'regular-user-id',
        role: 'regular',
        email: 'user@example.com',
      };
      mockGetLocksForYear.mockResolvedValue(mockLocks);

      await listLocks(mockRequest as Request, mockResponse as Response);

      expect(mockGetLocksForYear).toHaveBeenCalledWith(2026);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: {
          locks: mockLocks,
        },
      });
    });

    it('should return 400 for missing year parameter', async () => {
      mockRequest.query = {};

      await listLocks(mockRequest as Request, mockResponse as Response);

      expect(mockGetLocksForYear).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
          }),
        })
      );
    });

    it('should return 400 for invalid year parameter', async () => {
      mockRequest.query = { year: 'invalid' };

      await listLocks(mockRequest as Request, mockResponse as Response);

      expect(mockGetLocksForYear).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
          }),
        })
      );
    });

    it('should return 400 for year outside valid range', async () => {
      mockRequest.query = { year: '1999' };

      await listLocks(mockRequest as Request, mockResponse as Response);

      expect(mockGetLocksForYear).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should return 500 for unexpected errors', async () => {
      mockRequest.query = { year: '2026' };
      mockGetLocksForYear.mockRejectedValue(new Error('Database error'));

      await listLocks(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        },
      });
    });
  });

  describe('batchUpdateLocks', () => {
    it('should batch lock and unlock months successfully', async () => {
      mockRequest.body = {
        year: 2026,
        operations: {
          lock: [3, 4],
          unlock: [1, 2],
        },
      };

      const mockResult = {
        locked: [3, 4],
        unlocked: [1, 2],
      };

      mockBatchUpdate.mockResolvedValue(mockResult);

      await batchUpdateLocks(mockRequest as Request, mockResponse as Response);

      expect(mockBatchUpdate).toHaveBeenCalledWith(
        'admin-user-id',
        2026,
        [3, 4],
        [1, 2]
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });

    it('should handle empty lock arrays', async () => {
      mockRequest.body = {
        year: 2026,
        operations: {
          lock: [],
          unlock: [],
        },
      };

      const mockResult = {
        locked: [],
        unlocked: [],
      };

      mockBatchUpdate.mockResolvedValue(mockResult);

      await batchUpdateLocks(mockRequest as Request, mockResponse as Response);

      expect(mockBatchUpdate).toHaveBeenCalledWith('admin-user-id', 2026, [], []);
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });

    it('should handle partial success in batch operations', async () => {
      mockRequest.body = {
        year: 2026,
        operations: {
          lock: [1, 2, 3],
          unlock: [4, 5],
        },
      };

      const mockResult = {
        locked: [2, 3],
        unlocked: [4],
      };

      mockBatchUpdate.mockResolvedValue(mockResult);

      await batchUpdateLocks(mockRequest as Request, mockResponse as Response);

      expect(mockBatchUpdate).toHaveBeenCalledWith(
        'admin-user-id',
        2026,
        [1, 2, 3],
        [4, 5]
      );
      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
      });
    });

    it('should return 400 for missing year', async () => {
      mockRequest.body = {
        operations: {
          lock: [3, 4],
          unlock: [1, 2],
        },
      };

      await batchUpdateLocks(mockRequest as Request, mockResponse as Response);

      expect(mockBatchUpdate).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
          }),
        })
      );
    });

    it('should return 400 for missing operations', async () => {
      mockRequest.body = {
        year: 2026,
      };

      await batchUpdateLocks(mockRequest as Request, mockResponse as Response);

      expect(mockBatchUpdate).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
          }),
        })
      );
    });

    it('should return 400 for invalid month numbers', async () => {
      mockRequest.body = {
        year: 2026,
        operations: {
          lock: [0, 13],
          unlock: [1],
        },
      };

      await batchUpdateLocks(mockRequest as Request, mockResponse as Response);

      expect(mockBatchUpdate).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should return 401 when user ID is not found', async () => {
      mockRequest.body = {
        year: 2026,
        operations: {
          lock: [3, 4],
          unlock: [1, 2],
        },
      };

      (mockRequest as AuthenticatedRequest).user = undefined;

      await batchUpdateLocks(mockRequest as Request, mockResponse as Response);

      expect(mockBatchUpdate).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'User ID not found in token',
          code: 'UNAUTHORIZED',
        },
      });
    });

    it('should return 401 when userId is missing from token', async () => {
      mockRequest.body = {
        year: 2026,
        operations: {
          lock: [3, 4],
          unlock: [1, 2],
        },
      };

      (mockRequest as AuthenticatedRequest).user = {
        role: 'admin',
        email: 'admin@example.com',
      };

      await batchUpdateLocks(mockRequest as Request, mockResponse as Response);

      expect(mockBatchUpdate).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(401);
    });

    it('should return 500 for unexpected errors', async () => {
      mockRequest.body = {
        year: 2026,
        operations: {
          lock: [3, 4],
          unlock: [1, 2],
        },
      };

      mockBatchUpdate.mockRejectedValue(new Error('Database error'));

      await batchUpdateLocks(mockRequest as Request, mockResponse as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        },
      });
    });
  });
});
