
import { apiClient } from '../api';
import { AdminTaskAssignment, User } from '@abra-shift-master/shared';

// Define types locally if not in shared yet
// Ideally these should be in shared package.
export interface Client {
    client_id: string;
    name: string;
    contact_info?: string;
    active: boolean;
}

export interface Project {
    project_id: string;
    client_id: string;
    name: string;
    description?: string;
    start_date: string;
    end_date?: string;
    active: boolean;
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

export const assignmentService = {
    fetchClients: async () => {
        const clients = await apiClient.get<Client[]>('/clients');
        return clients || [];
    },

    fetchProjects: async () => {
        const projects = await apiClient.get<Project[]>('/projects');
        return projects || [];
    },

    fetchTasks: async () => {
        const tasks = await apiClient.get<Task[]>('/tasks');
        return tasks || [];
    },

    fetchAssignmentsByTaskId: async (taskId: string) => {
        const assignments = await apiClient.get<AdminTaskAssignment[]>(`/tasks/${taskId}/assignments`);
        return assignments || [];
    },

    fetchAllAssignments: async () => {
        const assignments = await apiClient.get<AdminTaskAssignment[]>('/tasks/assignments');
        return assignments || [];
    },

    assignEmployees: async (taskId: string, employeeIds: string[]) => {
        await apiClient.post(`/tasks/${taskId}/assignments`, { employeeIds });
    },

    // Re-export fetchUsers from here or just use the one in EmployeesPage?
    // Better to keep it consistent. Since we need "potential employees", we can add a helper here or reuse apiClient directly.
    fetchPotentialEmployees: async (): Promise<User[]> => {
        // Fetch active users for assignment
        // ApiClient.get() unwraps the API envelope, returning { users, pagination }
        const response = await apiClient.get<{ users: User[], pagination: { total: number; page: number; limit: number; totalPages: number } }>('/users', { params: { active: true, limit: 1000 } });
        return response.users || [];
    }
};
