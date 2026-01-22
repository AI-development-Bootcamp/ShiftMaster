/**
 * Entry transformers for converting backend entries to UI format
 */

import type {
    WorkEntryResponse,
    AbsenceEntryResponse,
} from '@abra-shift-master/shared';
import type { DailyEntry, AbsenceType } from '../components/DailyEntryCard/DailyEntryCard';
import type { TimeEntry } from '../components/TimeEntryItem/TimeEntryItem';
import type { EntryStatus } from '../components/StatusBadge/StatusBadge';

/**
 * Convert 24-hour time string (HH:MM:SS) to 12-hour display format
 */
export function convertTo12Hour(timeString: string | null): string {
    if (!timeString) return '';

    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
}

/**
 * Convert 12-hour time to 24-hour format (HH:MM:SS)
 */
export function convertTo24Hour(
    hours: number,
    minutes: number,
    period: 'AM' | 'PM'
): string {
    let hours24 = hours;

    if (period === 'AM') {
        if (hours === 12) hours24 = 0;
    } else {
        if (hours !== 12) hours24 = hours + 12;
    }

    return `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
}

/**
 * Calculate total duration from assignments in hours
 */
function calculateTotalDuration(
    assignments: WorkEntryResponse['assignments']
): number {
    if (!assignments || assignments.length === 0) return 0;

    let totalMinutes = 0;

    for (const assignment of assignments) {
        if (assignment.duration_minutes) {
            totalMinutes += assignment.duration_minutes;
        } else if (assignment.start_time && assignment.end_time) {
            const start = timeToMinutes(assignment.start_time);
            const end = timeToMinutes(assignment.end_time);
            totalMinutes += end - start;
        }
    }

    return totalMinutes / 60;
}

/**
 * Convert time string to minutes since midnight
 */
function timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Get Hebrew day name from date
 */
function getDayName(date: Date): string {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    return days[date.getDay()];
}

/**
 * Format date as display string (e.g., "22 ינואר")
 */
function formatDateDisplay(date: Date): string {
    const day = date.getDate();
    const months = [
        'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
        'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
    ];
    return `${day} ${months[date.getMonth()]}`;
}

/**
 * Map absence type from backend to UI type
 */
function mapAbsenceType(absenceType: string): AbsenceType {
    switch (absenceType) {
        case 'sick':
            return 'sick';
        case 'vacation':
            return 'vacation-full';
        case 'vacation_partial':
            return 'vacation-half';
        case 'reserve':
            return 'reserves';
        default:
            return null;
    }
}

/**
 * Get EntryStatus from absence type
 */
function getStatusFromAbsenceType(absenceType: string): EntryStatus {
    switch (absenceType) {
        case 'sick':
            return 'sick';
        case 'vacation_partial':
            return 'half-vacation';
        default:
            return 'complete';
    }
}

/**
 * Transform a work entry response to DailyEntry format
 */
export function transformWorkEntryToDailyEntry(
    workEntry: WorkEntryResponse
): DailyEntry {
    const assignments = workEntry.assignments || [];
    const totalHours = calculateTotalDuration(assignments);
    const date = new Date(workEntry.work_date);

    // Convert assignments to TimeEntry format
    const timeEntries: TimeEntry[] = assignments.map((assignment) => ({
        id: assignment.entry_assignment_id || `${workEntry.entry_id}-${assignment.task_id}`,
        projectName: assignment.project_name || 'פרויקט',
        startTime: assignment.start_time ? convertTo12Hour(assignment.start_time) : '',
        endTime: assignment.end_time ? convertTo12Hour(assignment.end_time) : '',
        hours: assignment.duration_minutes
            ? String((assignment.duration_minutes / 60).toFixed(1))
            : '0',
    }));

    // Determine status based on hours
    let status: EntryStatus = 'missing';
    if (totalHours >= 9) {
        status = 'complete';
    } else if (totalHours > 0) {
        status = 'partial';
    }

    return {
        id: workEntry.entry_id,
        date: formatDateDisplay(date),
        dayName: getDayName(date),
        status,
        hours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
        timeEntries,
    };
}

/**
 * Transform an absence entry response to DailyEntry format
 */
export function transformAbsenceEntryToDailyEntry(
    absenceEntry: AbsenceEntryResponse
): DailyEntry {
    const date = new Date(absenceEntry.work_date);

    return {
        id: absenceEntry.entry_id,
        date: formatDateDisplay(date),
        dayName: getDayName(date),
        status: getStatusFromAbsenceType(absenceEntry.absence_type),
        absenceType: mapAbsenceType(absenceEntry.absence_type),
        timeEntries: [],
    };
}

/**
 * Combine and sort entries for a month
 */
export function combineAndSortEntries(
    workEntries: WorkEntryResponse[],
    absenceEntries: AbsenceEntryResponse[]
): DailyEntry[] {
    const entries: DailyEntry[] = [];

    // Transform work entries
    for (const workEntry of workEntries) {
        entries.push(transformWorkEntryToDailyEntry(workEntry));
    }

    // Transform absence entries (skip if work entry exists for same date)
    const workDates = new Set(workEntries.map((e) => e.work_date));
    for (const absenceEntry of absenceEntries) {
        if (!workDates.has(absenceEntry.work_date)) {
            entries.push(transformAbsenceEntryToDailyEntry(absenceEntry));
        }
    }

    // Sort by date string (works since format is consistent)
    entries.sort((a, b) => {
        // Extract day number for basic sorting
        const dayA = parseInt(a.date.split(' ')[0], 10);
        const dayB = parseInt(b.date.split(' ')[0], 10);
        return dayB - dayA; // Descending
    });

    return entries;
}
