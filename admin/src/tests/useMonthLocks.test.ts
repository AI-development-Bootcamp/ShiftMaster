import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMonthLocks } from '../hooks/useMonthLocks';
import { mockMonthLocks } from '../mocks/monthLocks';

describe('useMonthLocks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('returns loading state initially', () => {
    const { result } = renderHook(() => useMonthLocks(2024));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.locks).toEqual([]);
  });

  it('loads locks for the specified year', async () => {
    const { result } = renderHook(() => useMonthLocks(2024));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // mockMonthLocks has 2 locks for year 2024 (January and February)
    expect(result.current.locks).toHaveLength(2);
    expect(result.current.locks[0].year).toBe(2024);
    expect(result.current.locks[1].year).toBe(2024);
  });

  it('returns empty array when no locks exist for the year', async () => {
    const { result } = renderHook(() => useMonthLocks(2025));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.locks).toEqual([]);
  });

  it('reloads data when year changes', async () => {
    const { result, rerender } = renderHook(
      ({ year }) => useMonthLocks(year),
      { initialProps: { year: 2024 } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.locks).toHaveLength(2);

    // Change year
    act(() => {
      rerender({ year: 2025 });
    });

    // Should be loading again
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.locks).toEqual([]);
  });

  describe('toggleLock', () => {
    it('creates a new lock when month is unlocked', async () => {
      const { result } = renderHook(() => useMonthLocks(2024));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCount = result.current.locks.length;

      // Toggle an unlocked month (e.g., March = month 3)
      act(() => {
        result.current.toggleLock(2024, 3);
      });

      // Check console.log was called with CREATE payload
      expect(console.log).toHaveBeenCalledWith(
        '[MonthLock] Prepare CREATE:',
        expect.objectContaining({
          operation: 'create',
          payload: expect.objectContaining({
            year: 2024,
            month: 3,
            lockedByUserId: expect.any(Number)
          })
        })
      );

      // Optimistic update should add the lock immediately
      expect(result.current.locks).toHaveLength(initialCount + 1);
      const newLock = result.current.locks.find(lock => lock.month === 3);
      expect(newLock).toBeDefined();
      expect(newLock?.year).toBe(2024);
    });

    it('removes a lock when month is locked', async () => {
      const { result } = renderHook(() => useMonthLocks(2024));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCount = result.current.locks.length;
      const existingLock = result.current.locks[0]; // January lock

      // Toggle a locked month
      act(() => {
        result.current.toggleLock(existingLock.year, existingLock.month);
      });

      // Check console.log was called with DELETE payload
      expect(console.log).toHaveBeenCalledWith(
        '[MonthLock] Prepare DELETE:',
        expect.objectContaining({
          operation: 'delete',
          lockId: existingLock.lock_id,
          year: existingLock.year,
          month: existingLock.month
        })
      );

      // Optimistic update should remove the lock immediately
      expect(result.current.locks).toHaveLength(initialCount - 1);
      const removedLock = result.current.locks.find(
        lock => lock.lock_id === existingLock.lock_id
      );
      expect(removedLock).toBeUndefined();
    });

    it('handles multiple toggles correctly', async () => {
      const { result } = renderHook(() => useMonthLocks(2024));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Add March
      act(() => {
        result.current.toggleLock(2024, 3);
      });

      const afterAdd = result.current.locks.length;

      // Remove March
      act(() => {
        result.current.toggleLock(2024, 3);
      });

      expect(result.current.locks.length).toBe(afterAdd - 1);

      // Add it again
      act(() => {
        result.current.toggleLock(2024, 3);
      });

      expect(result.current.locks.length).toBe(afterAdd);
    });
  });
});
