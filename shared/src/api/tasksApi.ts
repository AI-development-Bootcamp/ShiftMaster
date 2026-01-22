/**
 * Tasks API client for task tree endpoints
 */

import { ApiClient } from './client.js';
import type { TaskTreeProject } from '../types/index.js';

export interface TasksApiClient {
    apiClient: ApiClient;
}

/**
 * Get user's assigned task tree
 */
export async function getTaskTree(
    client: TasksApiClient,
    options?: {
        includeInactive?: boolean;
        projectId?: string;
    }
): Promise<{ projects: TaskTreeProject[] }> {
    let url = '/me/task-tree';
    const params: string[] = [];

    if (options?.includeInactive) {
        params.push('include_inactive=true');
    }
    if (options?.projectId) {
        params.push(`project_id=${options.projectId}`);
    }

    if (params.length > 0) {
        url += '?' + params.join('&');
    }

    return client.apiClient.get<{ projects: TaskTreeProject[] }>(url);
}
