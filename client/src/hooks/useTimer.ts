/**
 * Custom hook for timer functionality with Redux integration
 * Handles clock-in/clock-out, timer ticking, and persistence
 */
import { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
    clockIn,
    clockOut,
    resumeTimer,
    tickElapsed,
    clearError,
} from '../store/slices/timerSlice';

// Get current time in HH:MM:SS format
const getCurrentTime = (): string => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

// Get current date in YYYY-MM-DD format
const getCurrentDate = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface UseTimerReturn {
    isRunning: boolean;
    elapsedSeconds: number;
    loading: boolean;
    error: string | null;
    activeEntry: {
        entry_id: number;
        work_date: string;
        start_time: string;
    } | null;
    handleClockIn: () => Promise<void>;
    handleClockOut: (taskId: number, location: string) => Promise<void>;
    clearTimerError: () => void;
}

export function useTimer(): UseTimerReturn {
    const dispatch = useAppDispatch();
    const { activeEntry, isRunning, elapsedSeconds, loading, error } =
        useAppSelector((state) => state.timer);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Resume timer on mount (check localStorage)
    useEffect(() => {
        dispatch(resumeTimer());
    }, [dispatch]);

    // Timer tick effect - update elapsed seconds every second
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                dispatch(tickElapsed());
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [isRunning, dispatch]);

    // Handle clock-in
    const handleClockIn = useCallback(async () => {
        const workDate = getCurrentDate();
        const startTime = getCurrentTime();

        await dispatch(clockIn({ workDate, startTime }));
    }, [dispatch]);

    // Handle clock-out
    const handleClockOut = useCallback(
        async (taskId: number, location: string) => {
            if (!activeEntry) {
                console.error('[USE_TIMER] Cannot clock out: no active entry');
                return;
            }

            const endTime = getCurrentTime();

            await dispatch(
                clockOut({
                    entryId: activeEntry.entry_id,
                    endTime,
                    taskId,
                    location,
                })
            );
        },
        [dispatch, activeEntry]
    );

    // Clear error
    const clearTimerError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        isRunning,
        elapsedSeconds,
        loading,
        error,
        activeEntry,
        handleClockIn,
        handleClockOut,
        clearTimerError,
    };
}

export default useTimer;
