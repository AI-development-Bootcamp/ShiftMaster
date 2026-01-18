import {
    NewUser,
    NewClient,
    NewProject,
    NewTask,
    NewEntry,
    NewAdminTaskAssignment,
    NewEntryAssignment
} from '../types/entities.js';

export interface SeedData {
    users: NewUser[];
    clients: NewClient[];
    projects: NewProject[];
    tasks: NewTask[];
    adminTaskAssignments?: NewAdminTaskAssignment[];
}
