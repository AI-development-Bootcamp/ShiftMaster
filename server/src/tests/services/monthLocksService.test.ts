/**
 * Tests for MonthLocksService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import { MonthLocksService } from '../../services/monthLocksService.js';
import { MonthLock } from '../../db/types/entities.js';

// Mock the MonthLockRepository
vi.mock('../../db/repositories/MonthLockRepository.js', () => {
  return {
    MonthLockRepository: vi.fn(() => ({
      findByYear: vi.fn(),
      findByYearAndMonth: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    })),
  };
});

describe('MonthLocksService', () => {
  let monthLocksService: MonthLocksService;
  let mockMonthLockRepo: {
    findByYear: ReturnType<typeof vi.fn>;
    findByYearAndMonth: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  const mockLock: MonthLock = {
    lock_id: '123e4567-e89b-12d3-a456-426614174000',
    year: 2026,
    month: 1,
    locked_at: '2026-02-05T09:00:00Z',
    locked_by: 'admin-user-id',
    unlocked_at: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    const mockSupabaseClient = {} as SupabaseClient;
    monthLocksService = new MonthLocksService(mockSupabaseClient);

    mockMonthLockRepo = (
      monthLocksService as unknown as { monthLockRepo: typeof mockMonthLockRepo }
    ).monthLockRepo;
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

    it('should lock months that are not already locked', async () => {
      mockMonthLockRepo.findByYearAndMonth.mockResolvedValue(null);
      mockMonthLockRepo.create.mockResolvedValue(mockLock);

      const result = await monthLocksService.batchUpdate(
        actorId,
        year,
        [1, 2, 3],
        []
      );

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

    it('should unlock months that are locked', async () => {
      const lockedMonth1 = { ...mockLock, month: 1 };
      const lockedMonth2 = { ...mockLock, month: 2 };

      mockMonthLockRepo.findByYearAndMonth
        .mockResolvedValueOnce(lockedMonth1)
        .mockResolvedValueOnce(lockedMonth2);
      mockMonthLockRepo.update.mockResolvedValue(undefined);

      const result = await monthLocksService.batchUpdate(
        actorId,
        year,
        [],
        [1, 2]
      );

      expect(mockMonthLockRepo.findByYearAndMonth).toHaveBeenCalledTimes(2);
      expect(mockMonthLockRepo.update).toHaveBeenCalledTimes(2);
      expect(mockMonthLockRepo.update).toHaveBeenCalledWith(
        lockedMonth1.lock_id,
        expect.objectContaining({
          unlocked_at: expect.any(String),
        })
      );
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
      mockMonthLockRepo.update.mockResolvedValue(undefined);

      const result = await monthLocksService.batchUpdate(
        actorId,
        year,
        [3, 4],
        [5, 6]
      );

      expect(mockMonthLockRepo.create).toHaveBeenCalledTimes(2);
      expect(mockMonthLockRepo.update).toHaveBeenCalledTimes(2);
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

      mockMonthLockRepo.update.mockResolvedValue(undefined);

      const result = await monthLocksService.batchUpdate(
        actorId,
        year,
        [],
        [1, 2]
      );

      expect(mockMonthLockRepo.findByYearAndMonth).toHaveBeenCalledTimes(2);
      expect(mockMonthLockRepo.update).toHaveBeenCalledTimes(1);
      expect(result.locked).toEqual([]);
      expect(result.unlocked).toEqual([2]);
    });

    it('should handle empty lock and unlock arrays', async () => {
      const result = await monthLocksService.batchUpdate(actorId, year, [], []);

      expect(mockMonthLockRepo.findByYearAndMonth).not.toHaveBeenCalled();
      expect(mockMonthLockRepo.create).not.toHaveBeenCalled();
      expect(mockMonthLockRepo.update).not.toHaveBeenCalled();
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
