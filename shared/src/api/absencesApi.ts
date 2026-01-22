/**
 * Absences API client for absence entries CRUD
 */

import { ApiClient } from './client.js';
import type {
    CreateAbsenceEntryRequest,
    AbsenceEntryResponse,
} from '../types/index.js';

export interface AbsencesApiClient {
    apiClient: ApiClient;
}

/**
 * Create an absence entry (single day or range)
 */
export async function createAbsenceEntry(
    client: AbsencesApiClient,
    absenceData: CreateAbsenceEntryRequest
): Promise<{ entries: AbsenceEntryResponse[] }> {
    return client.apiClient.post<{ entries: AbsenceEntryResponse[] }>(
        '/absences',
        absenceData
    );
}

/**
 * Get absences by date range
 */
export async function getAbsencesByDateRange(
    client: AbsencesApiClient,
    startDate: string,
    endDate: string,
    absenceType?: string
): Promise<{ absences: AbsenceEntryResponse[] }> {
    let url = `/absences?start_date=${startDate}&end_date=${endDate}`;
    if (absenceType) {
        url += `&absence_type=${absenceType}`;
    }
    return client.apiClient.get<{ absences: AbsenceEntryResponse[] }>(url);
}

/**
 * Get absences for a specific month
 */
export async function getAbsencesByMonth(
    client: AbsencesApiClient,
    year: number,
    month: number,
    absenceType?: string
): Promise<{ absences: AbsenceEntryResponse[] }> {
    let url = `/absences?year=${year}&month=${month}`;
    if (absenceType) {
        url += `&absence_type=${absenceType}`;
    }
    return client.apiClient.get<{ absences: AbsenceEntryResponse[] }>(url);
}
