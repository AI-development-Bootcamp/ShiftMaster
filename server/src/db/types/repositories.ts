import type {
    User, NewUser, UpdateUser,
    Client, NewClient, UpdateClient,
    Project, NewProject, UpdateProject,
    Task, NewTask, UpdateTask,
    AdminTaskAssignment, NewAdminTaskAssignment, UpdateAdminTaskAssignment,
    Entry, NewEntry, UpdateEntry,
    EntryAssignment, NewEntryAssignment, UpdateEntryAssignment,
    MonthLock, NewMonthLock, UpdateMonthLock
} from './entities.js';

/**
 * Base repository interface that all repositories should implement.
 * Provides standard CRUD operations.
 */
export interface IBaseRepository<T, NewT, UpdateT> {
    create(data: NewT): Promise<T>;
    findById(id: string): Promise<T | null>;
    findAll(): Promise<T[]>;
    update(id: string, data: UpdateT): Promise<T>;
    delete(id: string): Promise<boolean>;
}

export interface IUserRepository extends IBaseRepository<User, NewUser, UpdateUser> {
    findByEmail(email: string): Promise<User | null>;
    findPaginated(page: number, limit: number): Promise<{ data: User[]; count: number }>;
}

export interface IClientRepository extends IBaseRepository<Client, NewClient, UpdateClient> {
    findActive(): Promise<Client[]>;
    findPaginated(
        page: number,
        limit: number,
        search?: string,
        sort?: 'asc' | 'desc',
        includeInactive?: boolean
    ): Promise<{ data: Client[]; count: number }>;
}

export interface IProjectRepository extends IBaseRepository<Project, NewProject, UpdateProject> {
    findByClientId(clientId: string): Promise<Project[]>;
    findActive(): Promise<Project[]>;
}

export interface ITaskRepository extends IBaseRepository<Task, NewTask, UpdateTask> {
    findByProjectId(projectId: string): Promise<Task[]>;
}

export interface IAdminTaskAssignmentRepository extends IBaseRepository<AdminTaskAssignment, NewAdminTaskAssignment, UpdateAdminTaskAssignment> {
    findByUserId(userId: string): Promise<AdminTaskAssignment[]>;
    findByTaskId(taskId: string): Promise<AdminTaskAssignment[]>;
    revoke(id: string): Promise<void>;
}

export interface IEntryRepository extends IBaseRepository<Entry, NewEntry, UpdateEntry> {
    findByUserIdAndDate(userId: string, date: string): Promise<Entry[]>;
    findByUserIdAndDateRange(userId: string, startDate: string, endDate: string): Promise<Entry[]>;
}

export interface IEntryAssignmentRepository extends IBaseRepository<EntryAssignment, NewEntryAssignment, UpdateEntryAssignment> {
    findByEntryId(entryId: string): Promise<EntryAssignment[]>;
}

export interface IMonthLockRepository extends IBaseRepository<MonthLock, NewMonthLock, UpdateMonthLock> {
    findByYearAndMonth(year: number, month: number): Promise<MonthLock | null>;
    isMonthLocked(year: number, month: number): Promise<boolean>;
}
