/**
 * Custom hook for timeline functionality with Redux integration
 * Handles fetching and displaying entries grouped by date
 */
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import {
    fetchTimeline,
    toggleDayExpanded,
    clearError,
    TimelineDay,
} from '../store/slices/timelineSlice';

// Get start and end dates for a given month
const getMonthDateRange = (
    year: number,
    month: number
): { startDate: string; endDate: string } => {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of month

    const formatDate = (date: Date): string => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
    };
};

interface UseTimelineReturn {
    timeline: TimelineDay[];
    loading: boolean;
    error: string | null;
    fetchMonth: (year: number, month: number) => void;
    toggleDay: (workDate: string) => void;
    clearTimelineError: () => void;
    refresh: () => void;
}

export function useTimeline(): UseTimelineReturn {
    const dispatch = useAppDispatch();
    const { timeline, loading, error } = useAppSelector((state) => state.timeline);

    // Track current month for refresh
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth();

    // Fetch timeline for a specific month
    const fetchMonth = useCallback(
        (year: number, month: number) => {
            currentYear = year;
            currentMonth = month;
            const { startDate, endDate } = getMonthDateRange(year, month);
            dispatch(fetchTimeline({ startDate, endDate }));
        },
        [dispatch]
    );

    // Refresh current month
    const refresh = useCallback(() => {
        fetchMonth(currentYear, currentMonth);
    }, [fetchMonth, currentYear, currentMonth]);

    // Toggle day expanded state
    const toggleDay = useCallback(
        (workDate: string) => {
            dispatch(toggleDayExpanded(workDate));
        },
        [dispatch]
    );

    // Clear error
    const clearTimelineError = useCallback(() => {
        dispatch(clearError());
    }, [dispatch]);

    return {
        timeline,
        loading,
        error,
        fetchMonth,
        toggleDay,
        clearTimelineError,
        refresh,
    };
}

export default useTimeline;
