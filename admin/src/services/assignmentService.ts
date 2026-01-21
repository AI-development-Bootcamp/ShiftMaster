
import { apiClient } from '../api';
import { AdminTaskAssignment, User } from '@abra-shift-master/shared';

// Custom error class for API errors with status codes
export class ApiError extends Error {
    code: number;
    originalError?: unknown;

    constructor(message: string, code: number, originalError?: unknown) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.originalError = originalError;
    }
}

// Define types locally for now, mirroring backend entities
export interface Client {
    client_id: string;
    name: string;
    contact_info?: string;
    active: boolean;
}

export interface CreateClientDTO {
    name: string;
    contact_info?: string;
}

export interface UpdateClientDTO {
    name?: string;
    contact_info?: string;
    active?: boolean;
}

export interface Project {
    project_id: string;
    client_id: string;
    manager_user_id?: string;
    name: string;
    description?: string;
    start_date: string; // ISO date string YYYY-MM-DD
    end_date?: string; // ISO date string YYYY-MM-DD
    time_format_type: 'sum' | 'start_end';
    active: boolean;
}

export interface CreateProjectDTO {
    client_id: string;
    manager_user_id?: string;
    name: string;
    description?: string;
    start_date: string;
    end_date?: string;
    time_format_type?: 'sum' | 'start_end';
}

export interface UpdateProjectDTO {
    client_id?: string;
    manager_user_id?: string;
    name?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    time_format_type?: 'sum' | 'start_end';
    active?: boolean;
}

export interface Task {
    task_id: string;
    project_id: string;
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    active: boolean;
}

export interface CreateTaskDTO {
    project_id: string;
    name: string;
    description?: string;
    start_date?: string;
    end_date?: string;
}

export interface UpdateTaskDTO {
    project_id?: string;
    name?: string;
    description?: string;
    start_date?: string;
    end_date?: string;
    active?: boolean;
}

// Helper to extract error details from API client errors
function extractErrorDetails(error: unknown): { status: number; message: string } {
    if (error && typeof error === 'object') {
        const err = error as { response?: { status?: number; data?: { message?: string; error?: { message?: string } } }; message?: string };
        const status = err.response?.status ?? 500;
        const message = err.response?.data?.error?.message ?? err.response?.data?.message ?? err.message ?? 'Unknown error';
        return { status, message };
    }
    return { status: 500, message: String(error) };
}

export const assignmentService = {
    // --- Clients ---
    fetchClients: async (active?: boolean): Promise<Client[]> => {
        try {
            const params = active !== undefined ? { active } : {};
            const result = await apiClient.get<Client[]>('/clients', { params });
            return result ?? [];
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new ApiError(`Failed to fetch clients: ${message}`, status, error);
        }
    },

    createClient: async (data: CreateClientDTO): Promise<Client> => {
        try {
            return await apiClient.post<Client>('/clients', data);
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new ApiError(`Failed to create client: ${message}`, status, error);
        }
    },

    updateClient: async (id: string, data: UpdateClientDTO): Promise<Client> => {
        try {
            return await apiClient.patch<Client>(`/clients/${id}`, data);
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new ApiError(`Failed to update client: ${message}`, status, error);
        }
    },

    deleteClient: async (id: string): Promise<string> => {
        try {
            const result = await apiClient.delete<{ message: string }>(`/clients/${id}`);
            return result.message;
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new ApiError(`Failed to delete client: ${message}`, status, error);
        }
    },

    // --- Projects ---
    fetchProjects: async (active?: boolean): Promise<Project[]> => {
        try {
            const params = active !== undefined ? { active } : {};
            const result = await apiClient.get<Project[]>('/projects', { params });
            return result ?? [];
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new ApiError(`Failed to fetch projects: ${message}`, status, error);
        }
    },

    createProject: async (data: CreateProjectDTO): Promise<Project> => {
        try {
            return await apiClient.post<Project>('/projects', data);
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new ApiError(`Failed to create project: ${message}`, status, error);
        }
    },

    updateProject: async (id: string, data: UpdateProjectDTO): Promise<Project> => {
        try {
            return await apiClient.patch<Project>(`/projects/${id}`, data);
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new ApiError(`Failed to update project: ${message}`, status, error);
        }
    },

    deleteProject: async (id: string): Promise<string> => {
        try {
            const result = await apiClient.delete<{ message: string }>(`/projects/${id}`);
            return result.message;
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new ApiError(`Failed to delete project: ${message}`, status, error);
        }
    },

    // --- Tasks ---
    fetchTasks: async (active?: boolean): Promise<Task[]> => {
        try {
            const params = active !== undefined ? { active } : {};
            const result = await apiClient.get<Task[]>('/tasks', { params });
            return result ?? [];
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new ApiError(`Failed to fetch tasks: ${message}`, status, error);
        }
    },

    createTask: async (data: CreateTaskDTO): Promise<Task> => {
        try {
            return await apiClient.post<Task>('/tasks', data);
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new ApiError(`Failed to create task: ${message}`, status, error);
        }
    },

    updateTask: async (id: string, data: UpdateTaskDTO): Promise<Task> => {
        try {
            return await apiClient.patch<Task>(`/tasks/${id}`, data);
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new ApiError(`Failed to update task: ${message}`, status, error);
        }
    },

    deleteTask: async (id: string): Promise<string> => {
        try {
            const result = await apiClient.delete<{ message: string }>(`/tasks/${id}`);
            return result.message;
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new ApiError(`Failed to delete task: ${message}`, status, error);
        }
    },

    // --- Assignments ---
    fetchAssignmentsByTaskId: async (taskId: string): Promise<AdminTaskAssignment[]> => {
        try {
            const result = await apiClient.get<AdminTaskAssignment[]>(`/tasks/${taskId}/assignments`);
            return result ?? [];
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new ApiError(`Failed to fetch assignments: ${message}`, status, error);
        }
    },

    fetchAllAssignments: async (): Promise<AdminTaskAssignment[]> => {
        try {
            const result = await apiClient.get<AdminTaskAssignment[]>('/tasks/assignments');
            return result ?? [];
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new ApiError(`Failed to fetch all assignments: ${message}`, status, error);
        }
    },

    assignEmployees: async (taskId: string, employeeIds: string[]) => {
        try {
            await apiClient.post(`/tasks/${taskId}/assignments`, { employeeIds });
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new ApiError(`Failed to assign employees: ${message}`, status, error);
        }
    },

    fetchPotentialEmployees: async (): Promise<User[]> => {
        try {
            // Fetch active users for assignment
            // ApiClient.get() unwraps the API envelope, returning { users, pagination }
            const response = await apiClient.get<{ users: User[], pagination: { total: number; page: number; limit: number; totalPages: number } }>('/users', { params: { active: true, limit: 1000 } });
            return response.users ?? [];
        } catch (error) {
            const { status, message } = extractErrorDetails(error);
            throw new ApiError(`Failed to fetch potential employees: ${message}`, status, error);
        }
    }
};
