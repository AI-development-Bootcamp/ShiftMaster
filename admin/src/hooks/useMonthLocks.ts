import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MonthLock } from '@abra-shift-master/shared';
import { monthLocksService } from '../services/monthLocksService';

/**
 * Hook for managing month locks data and operations across multiple years.
 *
 * This hook provides a batch-update interface for month lock management.
 * Users can toggle locks locally (pending state) across multiple years
 * and then save all changes in a single operation.
 *
 * Changes persist when navigating between years - they are only lost
 * when the modal is closed or changes are explicitly discarded.
 *
 * @param year - The currently viewed year (for display)
 * @param userId - The admin user ID (from Redux auth state) for creating new locks
 * @returns Object containing locks, pending state, operations, and status
 */
export function useMonthLocks(year: number, userId: string) {
  // serverLocksByYear: Map of year -> locks from the API
  const [serverLocksByYear, setServerLocksByYear] = useState<Map<number, MonthLock[]>>(new Map());
  // pendingLocksByYear: Map of year -> locks including user changes
  const [pendingLocksByYear, setPendingLocksByYear] = useState<Map<number, MonthLock[]>>(new Map());
  // Track which years have been loaded from API
  const loadedYearsRef = useRef<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load locks for the specified year from the API (only if not already loaded)
  useEffect(() => {
    // Skip if already loaded
    if (loadedYearsRef.current.has(year)) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    monthLocksService.fetchLocksForYear(year)
      .then((yearLocks) => {
        if (!cancelled) {
          loadedYearsRef.current.add(year);

          // Update server state for this year
          setServerLocksByYear(prev => {
            const next = new Map(prev);
            next.set(year, yearLocks);
            return next;
          });

          // Update pending state for this year ONLY if no pending changes exist
          setPendingLocksByYear(prev => {
            const next = new Map(prev);
            // Only set if not already modified by user
            if (!next.has(year)) {
              next.set(year, yearLocks);
            }
            return next;
          });

          setIsLoading(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('Failed to fetch month locks:', error);
          loadedYearsRef.current.add(year);

          setServerLocksByYear(prev => {
            const next = new Map(prev);
            next.set(year, []);
            return next;
          });

          setPendingLocksByYear(prev => {
            const next = new Map(prev);
            if (!next.has(year)) {
              next.set(year, []);
            }
            return next;
          });

          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [year]);

  /**
   * Toggles a month lock in the local pending state for any year.
   * Does NOT trigger an API call.
   */
  const toggleLock = useCallback((toggleYear: number, month: number) => {
    setPendingLocksByYear(currentMap => {
      const next = new Map(currentMap);
      const currentLocks = next.get(toggleYear) ?? [];
      const existingLock = currentLocks.find(lock => lock.year === toggleYear && lock.month === month);

      if (existingLock) {
        // Unlock: remove from pending
        next.set(toggleYear, currentLocks.filter(lock => lock.lock_id !== existingLock.lock_id));
      } else {
        // Lock: add to pending with actual admin user ID
        const newLock: MonthLock = {
          lock_id: crypto.randomUUID(),
          year: toggleYear,
          month,
          locked_at: new Date().toISOString(),
          locked_by: userId
        };
        next.set(toggleYear, [...currentLocks, newLock]);
      }
      return next;
    });
  }, [userId]);

  /**
   * Checks if there are uncommitted changes across ALL years.
   */
  const hasChanges = useMemo(() => {
    // Get all years that have either server or pending data
    const allYears = new Set([
      ...serverLocksByYear.keys(),
      ...pendingLocksByYear.keys()
    ]);

    for (const y of allYears) {
      const serverLocks = serverLocksByYear.get(y) ?? [];
      const pendingLocks = pendingLocksByYear.get(y) ?? [];

      // Quick length check
      if (serverLocks.length !== pendingLocks.length) return true;

      // Compare by year-month keys
      const serverSet = new Set(serverLocks.map(l => `${l.year}-${l.month}`));
      const pendingSet = new Set(pendingLocks.map(l => `${l.year}-${l.month}`));

      if (serverSet.size !== pendingSet.size) return true;
      for (const key of serverSet) {
        if (!pendingSet.has(key)) return true;
      }
    }
    return false;
  }, [serverLocksByYear, pendingLocksByYear]);

  /**
   * Commits all pending changes across ALL years to the server.
   */
  const saveChanges = useCallback(async () => {
    // Find all years with changes
    const yearsWithChanges: number[] = [];
    const allYears = new Set([
      ...serverLocksByYear.keys(),
      ...pendingLocksByYear.keys()
    ]);

    for (const y of allYears) {
      const serverLocks = serverLocksByYear.get(y) ?? [];
      const pendingLocks = pendingLocksByYear.get(y) ?? [];

      const serverSet = new Set(serverLocks.map(l => l.month));
      const pendingSet = new Set(pendingLocks.map(l => l.month));

      const toLock = [...pendingSet].filter(m => !serverSet.has(m));
      const toUnlock = [...serverSet].filter(m => !pendingSet.has(m));

      if (toLock.length > 0 || toUnlock.length > 0) {
        yearsWithChanges.push(y);
      }
    }

    if (yearsWithChanges.length === 0) return;

    // Save previous state for rollback
    const previousServerLocksByYear = new Map(serverLocksByYear);

    // Optimistically update server state
    setServerLocksByYear(new Map(pendingLocksByYear));

    try {
      // Send batch requests for each year with changes
      for (const y of yearsWithChanges.sort((a, b) => a - b)) {
        const serverLocks = previousServerLocksByYear.get(y) ?? [];
        const pendingLocks = pendingLocksByYear.get(y) ?? [];

        const serverSet = new Set(serverLocks.map(l => l.month));
        const pendingSet = new Set(pendingLocks.map(l => l.month));

        const toLock = [...pendingSet].filter(m => !serverSet.has(m)).sort((a, b) => a - b);
        const toUnlock = [...serverSet].filter(m => !pendingSet.has(m)).sort((a, b) => a - b);

        await monthLocksService.batchUpdateLocks({
          year: y,
          operations: { lock: toLock, unlock: toUnlock }
        });
      }
    } catch (error) {
      // Rollback on failure
      setServerLocksByYear(previousServerLocksByYear);
      setPendingLocksByYear(previousServerLocksByYear);
      throw error;
    }
  }, [pendingLocksByYear, serverLocksByYear]);

  /**
   * Discards local changes and reverts to server state for ALL years.
   */
  const discardChanges = useCallback(() => {
    setPendingLocksByYear(new Map(serverLocksByYear));
  }, [serverLocksByYear]);

  // Return locks for the currently viewed year
  const locks = useMemo(() => {
    return pendingLocksByYear.get(year) ?? [];
  }, [pendingLocksByYear, year]);

  return {
    locks, // Pending locks for the current year (for display)
    isLoading,
    toggleLock,
    saveChanges,
    discardChanges,
    hasChanges
  };
}
