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
    findById(id: number): Promise<T | null>;
    findAll(): Promise<T[]>;
    update(id: number, data: UpdateT): Promise<T>;
    delete(id: number): Promise<boolean>;
}

export interface IUserRepository extends IBaseRepository<User, NewUser, UpdateUser> {
    findByEmail(email: string): Promise<User | null>;
}

export interface IClientRepository extends IBaseRepository<Client, NewClient, UpdateClient> {
    findActive(): Promise<Client[]>;
}

export interface IProjectRepository extends IBaseRepository<Project, NewProject, UpdateProject> {
    findByClientId(clientId: number): Promise<Project[]>;
    findActive(): Promise<Project[]>;
}

export interface ITaskRepository extends IBaseRepository<Task, NewTask, UpdateTask> {
    findByProjectId(projectId: number): Promise<Task[]>;
}

export interface IAdminTaskAssignmentRepository extends IBaseRepository<AdminTaskAssignment, NewAdminTaskAssignment, UpdateAdminTaskAssignment> {
    findByUserId(userId: number): Promise<AdminTaskAssignment[]>;
    findByTaskId(taskId: number): Promise<AdminTaskAssignment[]>;
    revoke(id: number): Promise<void>;
}

export interface IEntryRepository extends IBaseRepository<Entry, NewEntry, UpdateEntry> {
    findByUserIdAndDate(userId: number, date: string): Promise<Entry[]>;
    findByUserIdAndDateRange(userId: number, startDate: string, endDate: string): Promise<Entry[]>;
}

export interface IEntryAssignmentRepository extends IBaseRepository<EntryAssignment, NewEntryAssignment, UpdateEntryAssignment> {
    findByEntryId(entryId: number): Promise<EntryAssignment[]>;
}

export interface IMonthLockRepository extends IBaseRepository<MonthLock, NewMonthLock, UpdateMonthLock> {
    findByYearAndMonth(year: number, month: number): Promise<MonthLock | null>;
    isMonthLocked(year: number, month: number): Promise<boolean>;
}
