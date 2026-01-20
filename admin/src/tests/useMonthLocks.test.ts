import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMonthLocks } from '../hooks/useMonthLocks';

describe('useMonthLocks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => { });
  });

  it('returns loading state initially', () => {
    const { result } = renderHook(() => useMonthLocks(2024));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.locks).toEqual([]);
    expect(result.current.hasChanges).toBe(false);
  });

  it('loads locks for the specified year', async () => {
    const { result } = renderHook(() => useMonthLocks(2024));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // mockMonthLocks has 2 locks for year 2024
    expect(result.current.locks).toHaveLength(2);
    expect(result.current.hasChanges).toBe(false);
  });

  describe('batch updates', () => {
    it('updates pending state and hasChanges when toggling', async () => {
      const { result } = renderHook(() => useMonthLocks(2024));

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

      // Console should NOT be called yet
      expect(console.log).not.toHaveBeenCalled();
    });

    it('reverts changes when calling discardChanges', async () => {
      const { result } = renderHook(() => useMonthLocks(2024));

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

    it('commits changes and logs payload when calling saveChanges', async () => {
      const { result } = renderHook(() => useMonthLocks(2024));

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

      // Verify console log payload
      expect(console.log).toHaveBeenCalledWith(
        '[MonthLock] Batch Update:',
        expect.objectContaining({
          payload: expect.objectContaining({
            year: 2024,
            operations: expect.objectContaining({
              lock: [3],
              unlock: [1]
            })
          })
        })
      );
    });

    it('resets hasChanges after saving', async () => {
      const { result } = renderHook(() => useMonthLocks(2024));

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
  });
});
