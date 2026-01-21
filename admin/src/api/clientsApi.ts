/**
 * Client API service for admin application
 * Handles all client CRUD operations via the server API
 */

import { Client } from '@abra-shift-master/shared';
import { apiClient } from './index';

// ============================================================================
// Types
// ============================================================================

export interface CreateClientInput {
    name: string;
    contact_info?: string;
}

export interface UpdateClientInput {
    name?: string;
    contact_info?: string;
    active?: boolean;
}

export interface ClientsListResponse {
    clients: Client[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface FetchClientsParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: 'asc' | 'desc';
    include_inactive?: boolean;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Fetch paginated list of clients
 */
export async function fetchClients(params: FetchClientsParams = {}): Promise<ClientsListResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set('page', String(params.page));
    if (params.limit) queryParams.set('limit', String(params.limit));
    if (params.search) queryParams.set('search', params.search);
    if (params.sort) queryParams.set('sort', params.sort);
    if (params.include_inactive) queryParams.set('include_inactive', 'true');

    const queryString = queryParams.toString();
    const url = queryString ? `/clients?${queryString}` : '/clients';

    return apiClient.get<ClientsListResponse>(url);
}

/**
 * Create a new client
 */
export async function createClient(data: CreateClientInput): Promise<{ client: Client }> {
    return apiClient.post<{ client: Client }>('/clients', data);
}

/**
 * Update an existing client
 */
export async function updateClient(
    clientId: string,
    data: UpdateClientInput
): Promise<{ client: Client }> {
    return apiClient.patch<{ client: Client }>(`/clients/${clientId}`, data);
}

/**
 * Soft delete a client (sets active = false)
 */
export async function deleteClient(clientId: string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/clients/${clientId}`);
}

/**
 * Get a single client by ID
 */
export async function getClient(clientId: string): Promise<{ client: Client }> {
    return apiClient.get<{ client: Client }>(`/clients/${clientId}`);
}
