import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMonthLocks } from '../hooks/useMonthLocks';
import { monthLocksService } from '../services/monthLocksService';
import { MonthLock } from '@abra-shift-master/shared';

// Mock the monthLocksService
vi.mock('../services/monthLocksService', () => ({
  monthLocksService: {
    fetchLocksForYear: vi.fn(),
    batchUpdateLocks: vi.fn(),
  },
}));

// Mock data for tests
const mockLocksFor2024: MonthLock[] = [
  {
    lock_id: 'a50e8400-e29b-41d4-a716-446655440000',
    year: 2024,
    month: 1, // January
    locked_at: '2024-02-05T09:00:00Z',
    locked_by: '550e8400-e29b-41d4-a716-446655440000',
  },
  {
    lock_id: 'a50e8400-e29b-41d4-a716-446655440001',
    year: 2024,
    month: 2, // February
    locked_at: '2024-03-05T09:00:00Z',
    locked_by: '550e8400-e29b-41d4-a716-446655440000',
  },
];

const mockLocksFor2025: MonthLock[] = [
  {
    lock_id: 'b50e8400-e29b-41d4-a716-446655440000',
    year: 2025,
    month: 6, // June
    locked_at: '2025-07-05T09:00:00Z',
    locked_by: '550e8400-e29b-41d4-a716-446655440000',
  },
];

const mockUserId = 'test-admin-user-id';

describe('useMonthLocks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => { });
    // Default mock: return 2 locks for 2024
    vi.mocked(monthLocksService.fetchLocksForYear).mockResolvedValue(mockLocksFor2024);
    vi.mocked(monthLocksService.batchUpdateLocks).mockResolvedValue({ locked: [], unlocked: [] });
  });

  it('returns loading state initially', () => {
    const { result } = renderHook(() => useMonthLocks(2024, mockUserId));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.locks).toEqual([]);
    expect(result.current.hasChanges).toBe(false);
  });

  it('loads locks for the specified year', async () => {
    const { result } = renderHook(() => useMonthLocks(2024, mockUserId));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Service returns 2 locks for year 2024
    expect(result.current.locks).toHaveLength(2);
    expect(result.current.hasChanges).toBe(false);
    expect(monthLocksService.fetchLocksForYear).toHaveBeenCalledWith(2024);
  });

  it('handles fetch error gracefully', async () => {
    vi.mocked(monthLocksService.fetchLocksForYear).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useMonthLocks(2024, mockUserId));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.locks).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  describe('batch updates', () => {
    it('updates pending state and hasChanges when toggling', async () => {
      const { result } = renderHook(() => useMonthLocks(2024, mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Toggle an unlocked month (March)
      act(() => {
        result.current.toggleLock(2024, 3);
      });

      // Should show in UI (pending locks)
      expect(result.current.locks).toHaveLength(3);
      // Should indicate changes
      expect(result.current.hasChanges).toBe(true);

      // Service should NOT be called yet
      expect(monthLocksService.batchUpdateLocks).not.toHaveBeenCalled();
    });

    it('uses provided userId when creating new locks', async () => {
      const { result } = renderHook(() => useMonthLocks(2024, mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Toggle an unlocked month (March)
      act(() => {
        result.current.toggleLock(2024, 3);
      });

      // Find the newly added lock
      const newLock = result.current.locks.find(l => l.month === 3);
      expect(newLock).toBeDefined();
      expect(newLock?.locked_by).toBe(mockUserId);
    });

    it('reverts changes when calling discardChanges', async () => {
      const { result } = renderHook(() => useMonthLocks(2024, mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialLength = result.current.locks.length;

      // Make a change
      act(() => {
        result.current.toggleLock(2024, 3);
      });

      expect(result.current.hasChanges).toBe(true);

      // Discard
      act(() => {
        result.current.discardChanges();
      });

      expect(result.current.locks).toHaveLength(initialLength);
      expect(result.current.hasChanges).toBe(false);
    });

    it('commits changes via service when calling saveChanges', async () => {
      const { result } = renderHook(() => useMonthLocks(2024, mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Lock March (was unlocked)
      act(() => {
        result.current.toggleLock(2024, 3);
      });

      // Unlock January (was locked)
      const januaryLock = result.current.locks.find(l => l.month === 1);
      if (januaryLock) {
        act(() => {
          result.current.toggleLock(2024, 1);
        });
      }

      // Save
      await act(async () => {
        await result.current.saveChanges();
      });

      // Verify service was called with correct payload
      expect(monthLocksService.batchUpdateLocks).toHaveBeenCalledWith(
        expect.objectContaining({
          year: 2024,
          operations: expect.objectContaining({
            lock: [3],
            unlock: [1]
          })
        })
      );
    });

    it('resets hasChanges after saving', async () => {
      const { result } = renderHook(() => useMonthLocks(2024, mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Lock March
      act(() => {
        result.current.toggleLock(2024, 3);
      });

      expect(result.current.hasChanges).toBe(true);

      // Save
      await act(async () => {
        await result.current.saveChanges();
      });

      expect(result.current.hasChanges).toBe(false);
    });

    it('rolls back on save failure', async () => {
      vi.mocked(monthLocksService.batchUpdateLocks).mockRejectedValue(new Error('Save failed'));

      const { result } = renderHook(() => useMonthLocks(2024, mockUserId));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialLength = result.current.locks.length;

      // Lock March
      act(() => {
        result.current.toggleLock(2024, 3);
      });

      expect(result.current.locks).toHaveLength(initialLength + 1);

      // Save should fail and rollback
      await act(async () => {
        try {
          await result.current.saveChanges();
        } catch {
          // Expected to throw
        }
      });

      // Should rollback to original state
      expect(result.current.locks).toHaveLength(initialLength);
      expect(result.current.hasChanges).toBe(false);
    });
  });

  describe('multi-year persistence', () => {
    beforeEach(() => {
      // Setup mock to return different locks for different years
      vi.mocked(monthLocksService.fetchLocksForYear).mockImplementation((year) => {
        if (year === 2024) return Promise.resolve(mockLocksFor2024);
        if (year === 2025) return Promise.resolve(mockLocksFor2025);
        return Promise.resolve([]);
      });
    });

    it('preserves changes when navigating between years', async () => {
      // Start with 2024
      const { result, rerender } = renderHook(
        ({ year }) => useMonthLocks(year, mockUserId),
        { initialProps: { year: 2024 } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Toggle March in 2024 (add lock)
      act(() => {
        result.current.toggleLock(2024, 3);
      });

      expect(result.current.locks).toHaveLength(3); // 2 original + 1 new
      expect(result.current.hasChanges).toBe(true);

      // Navigate to 2025
      rerender({ year: 2025 });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 2025 should show its own locks
      expect(result.current.locks).toHaveLength(1); // June lock

      // hasChanges should still be true (2024 has changes)
      expect(result.current.hasChanges).toBe(true);

      // Navigate back to 2024
      rerender({ year: 2024 });

      // 2024 changes should be preserved
      expect(result.current.locks).toHaveLength(3);
      expect(result.current.hasChanges).toBe(true);
    });

    it('does not refetch already loaded years', async () => {
      const { result, rerender } = renderHook(
        ({ year }) => useMonthLocks(year, mockUserId),
        { initialProps: { year: 2024 } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(monthLocksService.fetchLocksForYear).toHaveBeenCalledTimes(1);
      expect(monthLocksService.fetchLocksForYear).toHaveBeenCalledWith(2024);

      // Navigate to 2025
      rerender({ year: 2025 });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(monthLocksService.fetchLocksForYear).toHaveBeenCalledTimes(2);
      expect(monthLocksService.fetchLocksForYear).toHaveBeenCalledWith(2025);

      // Navigate back to 2024 - should NOT refetch
      rerender({ year: 2024 });

      expect(monthLocksService.fetchLocksForYear).toHaveBeenCalledTimes(2);
    });

    it('saves changes for all modified years', async () => {
      const { result, rerender } = renderHook(
        ({ year }) => useMonthLocks(year, mockUserId),
        { initialProps: { year: 2024 } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Toggle March in 2024
      act(() => {
        result.current.toggleLock(2024, 3);
      });

      // Navigate to 2025
      rerender({ year: 2025 });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Toggle July in 2025
      act(() => {
        result.current.toggleLock(2025, 7);
      });

      // Save all changes
      await act(async () => {
        await result.current.saveChanges();
      });

      // Should have called batchUpdateLocks for both years
      expect(monthLocksService.batchUpdateLocks).toHaveBeenCalledTimes(2);
      expect(monthLocksService.batchUpdateLocks).toHaveBeenCalledWith(
        expect.objectContaining({
          year: 2024,
          operations: expect.objectContaining({ lock: [3] })
        })
      );
      expect(monthLocksService.batchUpdateLocks).toHaveBeenCalledWith(
        expect.objectContaining({
          year: 2025,
          operations: expect.objectContaining({ lock: [7] })
        })
      );

      // hasChanges should be false after save
      expect(result.current.hasChanges).toBe(false);
    });

    it('detects hasChanges across all years', async () => {
      const { result, rerender } = renderHook(
        ({ year }) => useMonthLocks(year, mockUserId),
        { initialProps: { year: 2024 } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasChanges).toBe(false);

      // Toggle in 2024
      act(() => {
        result.current.toggleLock(2024, 3);
      });

      expect(result.current.hasChanges).toBe(true);

      // Navigate to 2025
      rerender({ year: 2025 });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // hasChanges should still be true even when viewing 2025
      expect(result.current.hasChanges).toBe(true);
    });

    it('discards changes for all years', async () => {
      const { result, rerender } = renderHook(
        ({ year }) => useMonthLocks(year, mockUserId),
        { initialProps: { year: 2024 } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Toggle in 2024
      act(() => {
        result.current.toggleLock(2024, 3);
      });

      // Navigate to 2025 and toggle
      rerender({ year: 2025 });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.toggleLock(2025, 7);
      });

      expect(result.current.hasChanges).toBe(true);
      expect(result.current.locks).toHaveLength(2); // June + July

      // Discard all changes
      act(() => {
        result.current.discardChanges();
      });

      expect(result.current.hasChanges).toBe(false);
      expect(result.current.locks).toHaveLength(1); // Only June (original)

      // Navigate back to 2024 - should also be reverted
      rerender({ year: 2024 });

      expect(result.current.locks).toHaveLength(2); // Original Jan + Feb
    });
  });
});
