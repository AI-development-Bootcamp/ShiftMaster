import { useState, useEffect, useCallback, useMemo } from 'react';
import { MonthLock } from '@abra-shift-master/shared';
import { mockMonthLocks } from '../mocks/monthLocks';
import { apiClient as api } from '../api';

/**
 * Hook for managing month locks data and operations.
 *
 * This hook provides a batch-update interface for month lock management.
 * Users can toggle locks locally (pending state) and then save all changes
 * in a single operation.
 *
 * @param year - The year to load month locks for
 * @returns Object containing locks, pending state, operations, and status
 */
export function useMonthLocks(year: number) {
  // serverLocks reflects the true state from the API/Mock
  const [serverLocks, setServerLocks] = useState<MonthLock[]>([]);
  // pendingLocks reflects the local state in the UI before saving
  const [pendingLocks, setPendingLocks] = useState<MonthLock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load locks for the specified year
  useEffect(() => {
    setIsLoading(true);

    // Simulate async data fetch (mock data)
    const timer = setTimeout(() => {
      const yearLocks = mockMonthLocks.filter(lock => lock.year === year);
      setServerLocks(yearLocks);
      setPendingLocks(yearLocks); // Pending starts synced with server
      setIsLoading(false);
    }, 150); // Small delay to show loading state

    return () => clearTimeout(timer);
  }, [year]);

  /**
   * Toggles a month lock in the local pending state.
   * Does NOT trigger an API call.
   */
  const toggleLock = useCallback((year: number, month: number) => {
    setPendingLocks(currentLocks => {
      const existingTx = currentLocks.find(lock => lock.year === year && lock.month === month);

      if (existingTx) {
        // Unlock: remove from pending
        return currentLocks.filter(lock => lock.lock_id !== existingTx.lock_id);
      } else {
        // Lock: add to pending
        const mockAdminUserId = '550e8400-e29b-41d4-a716-446655440000'; // TODO: Replace with actual admin user ID
        const newLock: MonthLock = {
          lock_id: crypto.randomUUID(), // Generate UUID
          year,
          month,
          locked_at: new Date().toISOString(),
          locked_by: mockAdminUserId
        };
        return [...currentLocks, newLock];
      }
    });
  }, []);

  /**
   * Checks if there are uncommitted changes.
   */
  const hasChanges = useMemo(() => {
    if (serverLocks.length !== pendingLocks.length) return true;

    // Check if every server lock is still in pending (by ID or month match for existing)
    // Simpler: Check simply by month/year set comparison since we only care about "is locked" status
    const serverSet = new Set(serverLocks.map(l => `${l.year}-${l.month}`));
    const pendingSet = new Set(pendingLocks.map(l => `${l.year}-${l.month}`));

    if (serverSet.size !== pendingSet.size) return true;
    for (const key of serverSet) {
      if (!pendingSet.has(key)) return true;
    }
    return false;
  }, [serverLocks, pendingLocks]);

  /**
   * Commits all pending changes to the "server".
   */
  const saveChanges = useCallback(async () => {
    // Calculate delta for API payload
    const initialMonths = new Set(serverLocks.map(l => l.month));
    const finalMonths = new Set(pendingLocks.map(l => l.month));

    const toLock = [...finalMonths].filter(m => !initialMonths.has(m)).sort((a, b) => a - b);
    const toUnlock = [...initialMonths].filter(m => !finalMonths.has(m)).sort((a, b) => a - b);

    if (toLock.length === 0 && toUnlock.length === 0) return;

    const payload = {
      year,
      operations: {
        lock: toLock,
        unlock: toUnlock
      }
    };

    // Optimistically update "server" state to match pending
    const previousServerLocks = serverLocks;
    setServerLocks(pendingLocks);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (api as any).batchUpdateMonthLocks(payload);
    } catch (error) {
      // Rollback on failure
      setServerLocks(previousServerLocks);
      setPendingLocks(previousServerLocks);
      throw error;
    }
  }, [pendingLocks, serverLocks, year]);

  /**
   * Discards local changes and reverts to server state.
   */
  const discardChanges = useCallback(() => {
    setPendingLocks(serverLocks);
  }, [serverLocks]);

  return {
    locks: pendingLocks, // UI should render pending state
    isLoading,
    toggleLock,
    saveChanges,
    discardChanges,
    hasChanges
  };
}
