import { apiClient } from './index';
import { Project, PaginatedResponse } from '@abra-shift-master/shared';

export interface CreateProjectInput {
    client_id: string;
    manager_user_id: string;
    name: string;
    description?: string;
    start_date: string;
    end_date?: string;
    time_format_type: 'sum' | 'start_end';
    active?: boolean;
}

export interface UpdateProjectInput {
    client_id?: string;
    manager_user_id?: string;
    name?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    time_format_type?: 'sum' | 'start_end';
    active?: boolean;
}

export interface FetchProjectsParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: 'asc' | 'desc';
    include_inactive?: boolean;
}

// Adjusting response type to match backend
export interface ProjectsListResponse extends PaginatedResponse<Project> {
    projects: Project[];
}

export const fetchProjects = async (params: FetchProjectsParams = {}): Promise<ProjectsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.include_inactive !== undefined) queryParams.append('include_inactive', String(params.include_inactive));

    const response = await apiClient.get<{ data: ProjectsListResponse }>(`/projects?${queryParams.toString()}`);
    return response.data;
};

export const createProject = async (data: CreateProjectInput): Promise<Project> => {
    const response = await apiClient.post<{ project: Project }>('/projects', data);
    return response.project;
};

export const updateProject = async (projectId: string, data: UpdateProjectInput): Promise<Project> => {
    const response = await apiClient.patch<{ project: Project }>(`/projects/${projectId}`, data);
    return response.project;
};

export const deleteProject = async (projectId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}`);
};

export const getProject = async (projectId: string): Promise<Project> => {
    const response = await apiClient.get<{ project: Project }>(`/projects/${projectId}`);
    return response.project;
};
