
import { apiClient } from '../api';
import { AdminTaskAssignment, User } from '@abra-shift-master/shared';

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

export const assignmentService = {
    // --- Clients ---
    fetchClients: async (active?: boolean): Promise<Client[]> => {
        const params = active !== undefined ? { active } : {};
        return await apiClient.get<Client[]>('/clients', { params }) || [];
    },

    createClient: async (data: CreateClientDTO): Promise<Client> => {
        return await apiClient.post<Client>('/clients', data);
    },

    updateClient: async (id: string, data: UpdateClientDTO): Promise<Client> => {
        return await apiClient.patch<Client>(`/clients/${id}`, data);
    },

    deleteClient: async (id: string): Promise<string> => {
        const result = await apiClient.delete<{ message: string }>(`/clients/${id}`);
        return result.message;
    },

    // --- Projects ---
    fetchProjects: async (active?: boolean): Promise<Project[]> => {
        const params = active !== undefined ? { active } : {};
        return await apiClient.get<Project[]>('/projects', { params }) || [];
    },

    createProject: async (data: CreateProjectDTO): Promise<Project> => {
        return await apiClient.post<Project>('/projects', data);
    },

    updateProject: async (id: string, data: UpdateProjectDTO): Promise<Project> => {
        return await apiClient.patch<Project>(`/projects/${id}`, data);
    },

    deleteProject: async (id: string): Promise<string> => {
        const result = await apiClient.delete<{ message: string }>(`/projects/${id}`);
        return result.message;
    },

    // --- Tasks ---
    fetchTasks: async (active?: boolean): Promise<Task[]> => {
        const params = active !== undefined ? { active } : {};
        return await apiClient.get<Task[]>('/tasks', { params }) || [];
    },

    createTask: async (data: CreateTaskDTO): Promise<Task> => {
        return await apiClient.post<Task>('/tasks', data);
    },

    updateTask: async (id: string, data: UpdateTaskDTO): Promise<Task> => {
        return await apiClient.patch<Task>(`/tasks/${id}`, data);
    },

    deleteTask: async (id: string): Promise<string> => {
        const result = await apiClient.delete<{ message: string }>(`/tasks/${id}`);
        return result.message;
    },

    // --- Assignments ---
    fetchAssignmentsByTaskId: async (taskId: string): Promise<AdminTaskAssignment[]> => {
        return await apiClient.get<AdminTaskAssignment[]>(`/tasks/${taskId}/assignments`) || [];
    },

    fetchAllAssignments: async (): Promise<AdminTaskAssignment[]> => {
        return await apiClient.get<AdminTaskAssignment[]>('/tasks/assignments') || [];
    },

    assignEmployees: async (taskId: string, employeeIds: string[]) => {
        await apiClient.post(`/tasks/${taskId}/assignments`, { employeeIds });
    },

    fetchPotentialEmployees: async (): Promise<User[]> => {
        // Fetch active users for assignment
        // ApiClient.get() unwraps the API envelope, returning { users, pagination }
        const response = await apiClient.get<{ users: User[], pagination: { total: number; page: number; limit: number; totalPages: number } }>('/users', { params: { active: true, limit: 1000 } });
        return response.users || [];
    }
};
