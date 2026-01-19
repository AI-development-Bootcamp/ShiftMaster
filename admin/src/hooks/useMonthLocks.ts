import { useState, useEffect, useCallback } from 'react';
import { MonthLock } from '@abra-shift-master/shared';
import { mockMonthLocks } from '../mocks/monthLocks';

/**
 * Hook for managing month locks data and operations.
 *
 * This hook provides an API-ready interface for month lock management.
 * Currently uses mock data, but can be swapped for real API calls without
 * changing component code.
 *
 * @param year - The year to load month locks for
 * @returns Object containing locks data, loading state, and toggle function
 *
 * @example
 * ```tsx
 * const { locks, isLoading, toggleLock } = useMonthLocks(2024);
 *
 * // Toggle a month lock
 * toggleLock(2024, 1); // Toggle January 2024
 * ```
 */
export function useMonthLocks(year: number) {
  const [locks, setLocks] = useState<MonthLock[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load locks for the specified year
  useEffect(() => {
    setIsLoading(true);

    // Simulate async data fetch (mock data)
    const timer = setTimeout(() => {
      const yearLocks = mockMonthLocks.filter(lock => lock.year === year);
      setLocks(yearLocks);
      setIsLoading(false);
    }, 150); // Small delay to show loading state

    return () => clearTimeout(timer);
  }, [year]);

  /**
   * Toggles a month lock state.
   *
   * If the month is unlocked, prepares a "create" payload and logs it.
   * If the month is locked, prepares a "delete" payload and logs it.
   *
   * The UI is updated optimistically (immediately) without waiting for server response.
   *
   * Future API integration:
   * - Create: POST /api/v1/month-locks with { year, month, lockedByUserId }
   * - Delete: DELETE /api/v1/month-locks/{lockId}
   *
   * @param year - The year of the month to toggle
   * @param month - The month number (1-12) to toggle
   */
  const toggleLock = useCallback((year: number, month: number) => {
    const existingLock = locks.find(lock => lock.year === year && lock.month === month);

    if (existingLock) {
      // Month is currently locked - prepare DELETE
      console.log('[MonthLock] Prepare DELETE:', {
        operation: 'delete',
        lockId: existingLock.lock_id,
        year,
        month,
        note: 'This will be sent to: DELETE /api/v1/month-locks/{lockId}'
      });

      // Optimistic update: remove lock
      setLocks(prevLocks => prevLocks.filter(lock => lock.lock_id !== existingLock.lock_id));
    } else {
      // Month is currently unlocked - prepare CREATE
      // Note: lockedByUserId should come from auth context in real implementation
      const mockAdminUserId = 1; // TODO: Replace with actual admin user ID from auth context

      const newLockPayload = {
        year,
        month,
        lockedByUserId: mockAdminUserId
      };

      console.log('[MonthLock] Prepare CREATE:', {
        operation: 'create',
        payload: newLockPayload,
        note: 'This will be sent to: POST /api/v1/month-locks'
      });

      // Optimistic update: add new lock
      const newLock: MonthLock = {
        lock_id: Date.now(), // Temporary ID until server responds
        year,
        month,
        locked_at: new Date().toISOString(),
        locked_by: mockAdminUserId
      };

      setLocks(prevLocks => [...prevLocks, newLock]);
    }
  }, [locks]);

  return {
    locks,
    isLoading,
    toggleLock
  };
}
