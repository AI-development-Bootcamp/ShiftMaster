/**
 * Tests for MonthLocksService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { MonthLocksService } from '../../services/monthLocksService.js';
import { MonthLock, User } from '../../db/types/entities.js';

// Mock the MonthLockRepository
vi.mock('../../db/repositories/MonthLockRepository.js', () => {
  return {
    MonthLockRepository: vi.fn(() => ({
      findByYear: vi.fn(),
      findByYearAndMonth: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    })),
  };
});

// Mock the UserRepository
vi.mock('../../db/repositories/UserRepository.js', () => {
  return {
    UserRepository: vi.fn(() => ({
      findById: vi.fn(),
    })),
  };
});

describe('MonthLocksService', () => {
  let monthLocksService: MonthLocksService;
  let mockMonthLockRepo: {
    findByYear: ReturnType<typeof vi.fn>;
    findByYearAndMonth: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let mockUserRepo: {
    findById: ReturnType<typeof vi.fn>;
  };

  const mockLock: MonthLock = {
    lock_id: '123e4567-e89b-12d3-a456-426614174000',
    year: 2026,
    month: 1,
    locked_at: '2026-02-05T09:00:00Z',
    locked_by: 'admin-user-id',
  };

  const mockAdminUser: User = {
    user_id: 'admin-user-id',
    full_name: 'Admin User',
    email: 'admin@example.com',
    password_hash: 'hashed-password',
    role: 'admin',
    job_title: 'Administrator',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    const mockSupabaseClient = {} as SupabaseClient;
    monthLocksService = new MonthLocksService(mockSupabaseClient);

    mockMonthLockRepo = (
      monthLocksService as unknown as { monthLockRepo: typeof mockMonthLockRepo }
    ).monthLockRepo;

    mockUserRepo = (
      monthLocksService as unknown as { userRepo: typeof mockUserRepo }
    ).userRepo;

    // By default, mock the user as an admin
    mockUserRepo.findById.mockResolvedValue(mockAdminUser);
  });

  describe('getLocksForYear', () => {
    it('should return all active locks for a specific year', async () => {
      const mockLocks: MonthLock[] = [
        { ...mockLock, month: 1 },
        { ...mockLock, month: 2 },
        { ...mockLock, month: 3 },
      ];

      mockMonthLockRepo.findByYear.mockResolvedValue(mockLocks);

      const result = await monthLocksService.getLocksForYear(2026);

      expect(mockMonthLockRepo.findByYear).toHaveBeenCalledWith(2026);
      expect(result).toEqual(mockLocks);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no locks exist for the year', async () => {
      mockMonthLockRepo.findByYear.mockResolvedValue([]);

      const result = await monthLocksService.getLocksForYear(2025);

      expect(mockMonthLockRepo.findByYear).toHaveBeenCalledWith(2025);
      expect(result).toEqual([]);
    });
  });

  describe('batchUpdate', () => {
    const actorId = 'admin-user-id';
    const year = 2026;

    it('should enforce admin access and reject non-admin users', async () => {
      const regularUser: User = {
        ...mockAdminUser,
        user_id: 'regular-user-id',
        role: 'regular',
      };

      mockUserRepo.findById.mockResolvedValue(regularUser);

      await expect(
        monthLocksService.batchUpdate('regular-user-id', year, [1], [])
      ).rejects.toThrow('Access denied: Only admins can lock/unlock months');

      // Ensure no lock operations occurred
      expect(mockMonthLockRepo.findByYearAndMonth).not.toHaveBeenCalled();
      expect(mockMonthLockRepo.create).not.toHaveBeenCalled();
    });

    it('should reject when user is not found', async () => {
      mockUserRepo.findById.mockResolvedValue(null);

      await expect(
        monthLocksService.batchUpdate('non-existent-user', year, [1], [])
      ).rejects.toThrow('Access denied: User not found');

      // Ensure no lock operations occurred
      expect(mockMonthLockRepo.findByYearAndMonth).not.toHaveBeenCalled();
      expect(mockMonthLockRepo.create).not.toHaveBeenCalled();
    });

    it('should check admin role before any lock operations', async () => {
      // Admin check should happen first, so if it fails, no repo methods should be called
      const regularUser: User = {
        ...mockAdminUser,
        user_id: 'regular-user-id',
        role: 'regular',
      };

      mockUserRepo.findById.mockResolvedValue(regularUser);

      await expect(
        monthLocksService.batchUpdate('regular-user-id', year, [1, 2, 3], [4, 5])
      ).rejects.toThrow('Access denied: Only admins can lock/unlock months');

      // Verify user was checked first
      expect(mockUserRepo.findById).toHaveBeenCalledWith('regular-user-id');
      expect(mockUserRepo.findById).toHaveBeenCalledTimes(1);

      // Verify no month operations occurred
      expect(mockMonthLockRepo.findByYearAndMonth).not.toHaveBeenCalled();
      expect(mockMonthLockRepo.create).not.toHaveBeenCalled();
      expect(mockMonthLockRepo.delete).not.toHaveBeenCalled();
    });

    it('should lock months that are not already locked', async () => {
      mockMonthLockRepo.findByYearAndMonth.mockResolvedValue(null);
      mockMonthLockRepo.create.mockResolvedValue(mockLock);

      const result = await monthLocksService.batchUpdate(
        actorId,
        year,
        [1, 2, 3],
        []
      );

      expect(mockUserRepo.findById).toHaveBeenCalledWith(actorId);
      expect(mockMonthLockRepo.findByYearAndMonth).toHaveBeenCalledTimes(3);
      expect(mockMonthLockRepo.create).toHaveBeenCalledTimes(3);
      expect(mockMonthLockRepo.create).toHaveBeenCalledWith({
        year: 2026,
        month: 1,
        locked_by: actorId,
      });
      expect(result.locked).toEqual([1, 2, 3]);
      expect(result.unlocked).toEqual([]);
    });

    it('should unlock months that are locked by deleting the row', async () => {
      const lockedMonth1 = { ...mockLock, month: 1 };
      const lockedMonth2 = { ...mockLock, month: 2 };

      mockMonthLockRepo.findByYearAndMonth
        .mockResolvedValueOnce(lockedMonth1)
        .mockResolvedValueOnce(lockedMonth2);
      mockMonthLockRepo.delete.mockResolvedValue(true);

      const result = await monthLocksService.batchUpdate(
        actorId,
        year,
        [],
        [1, 2]
      );

      expect(mockUserRepo.findById).toHaveBeenCalledWith(actorId);
      expect(mockMonthLockRepo.findByYearAndMonth).toHaveBeenCalledTimes(2);
      expect(mockMonthLockRepo.delete).toHaveBeenCalledTimes(2);
      expect(mockMonthLockRepo.delete).toHaveBeenCalledWith(lockedMonth1.lock_id);
      expect(mockMonthLockRepo.delete).toHaveBeenCalledWith(lockedMonth2.lock_id);
      expect(result.locked).toEqual([]);
      expect(result.unlocked).toEqual([1, 2]);
    });

    it('should handle both locking and unlocking in the same operation', async () => {
      mockMonthLockRepo.findByYearAndMonth
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ...mockLock, month: 5 })
        .mockResolvedValueOnce({ ...mockLock, month: 6 });

      mockMonthLockRepo.create.mockResolvedValue(mockLock);
      mockMonthLockRepo.delete.mockResolvedValue(true);

      const result = await monthLocksService.batchUpdate(
        actorId,
        year,
        [3, 4],
        [5, 6]
      );

      expect(mockMonthLockRepo.create).toHaveBeenCalledTimes(2);
      expect(mockMonthLockRepo.delete).toHaveBeenCalledTimes(2);
      expect(result.locked).toEqual([3, 4]);
      expect(result.unlocked).toEqual([5, 6]);
    });

    it('should skip locking months that are already locked (idempotent)', async () => {
      const alreadyLocked = { ...mockLock, month: 1 };
      mockMonthLockRepo.findByYearAndMonth
        .mockResolvedValueOnce(alreadyLocked)
        .mockResolvedValueOnce(null);

      mockMonthLockRepo.create.mockResolvedValue(mockLock);

      const result = await monthLocksService.batchUpdate(
        actorId,
        year,
        [1, 2],
        []
      );

      expect(mockMonthLockRepo.findByYearAndMonth).toHaveBeenCalledTimes(2);
      expect(mockMonthLockRepo.create).toHaveBeenCalledTimes(1);
      expect(mockMonthLockRepo.create).toHaveBeenCalledWith({
        year: 2026,
        month: 2,
        locked_by: actorId,
      });
      expect(result.locked).toEqual([2]);
      expect(result.unlocked).toEqual([]);
    });

    it('should skip unlocking months that are not locked (idempotent)', async () => {
      mockMonthLockRepo.findByYearAndMonth
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ ...mockLock, month: 2 });

      mockMonthLockRepo.delete.mockResolvedValue(true);

      const result = await monthLocksService.batchUpdate(
        actorId,
        year,
        [],
        [1, 2]
      );

      expect(mockMonthLockRepo.findByYearAndMonth).toHaveBeenCalledTimes(2);
      expect(mockMonthLockRepo.delete).toHaveBeenCalledTimes(1);
      expect(result.locked).toEqual([]);
      expect(result.unlocked).toEqual([2]);
    });

    it('should handle empty lock and unlock arrays', async () => {
      const result = await monthLocksService.batchUpdate(actorId, year, [], []);

      expect(mockUserRepo.findById).toHaveBeenCalledWith(actorId);
      expect(mockMonthLockRepo.findByYearAndMonth).not.toHaveBeenCalled();
      expect(mockMonthLockRepo.create).not.toHaveBeenCalled();
      expect(mockMonthLockRepo.delete).not.toHaveBeenCalled();
      expect(result.locked).toEqual([]);
      expect(result.unlocked).toEqual([]);
    });

    it('should process all months even if some operations fail', async () => {
      mockMonthLockRepo.findByYearAndMonth
        .mockResolvedValueOnce(null)
        .mockRejectedValueOnce(new Error('Database error'))
        .mockResolvedValueOnce(null);

      mockMonthLockRepo.create.mockResolvedValue(mockLock);

      await expect(
        monthLocksService.batchUpdate(actorId, year, [1, 2, 3], [])
      ).rejects.toThrow('Database error');

      expect(mockMonthLockRepo.findByYearAndMonth).toHaveBeenCalledTimes(2);
      expect(mockMonthLockRepo.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('constructor', () => {
    it('should throw error when dbConnection is not provided', () => {
      expect(() => new MonthLocksService(null as unknown as SupabaseClient)).toThrow(
        'dbConnection is required for MonthLocksService'
      );
    });
  });
});
