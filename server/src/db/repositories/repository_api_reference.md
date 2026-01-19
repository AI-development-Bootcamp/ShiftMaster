# Repository Layer API Reference

This document provides a summary of the Repository Layer architecture and the available functions for data access in the **AbraShiftMaster** server.

## Overview

The application uses the **Repository Pattern** to abstract database interactions.
*   **BaseRepository**: A generic class providing CRUD operations for all entities.
*   **Specific Repositories**: Classes extending `BaseRepository` to provide entity-specific queries.

---

## 🏗️ BaseRepository (Generic)

All repositories inherit from this class. It provides the following methods for any entity `T` (Read), `NewT` (Create), `UpdateT` (Update).

| Method | Signature | Description |
| :--- | :--- | :--- |
| **`create`** | `create(data: NewT): Promise<T>` | Creates a new record in the database. |
| **`findById`** | `findById(id: number): Promise<T \| null>` | Finds a single record by its primary key. Returns `null` if not found. |
| **`findAll`** | `findAll(): Promise<T[]>` | Retrieves all records from the table. |
| **`update`** | `update(id: number, data: UpdateT): Promise<T>` | Updates a specific record by ID. |
| **`delete`** | `delete(id: number): Promise<boolean>` | Deletes a record. Supports **Soft Delete** (`active: false`) for `users`, `clients`, `projects`, `tasks`, `admin_task_assignments`. |

---

## 📚 Specific Repositories

### 👤 UserRepository
*Extends `BaseRepository<User, NewUser, UpdateUser>`*
*   **`findByEmail(email: string): Promise<User | null>`**
    *   Finds a user by their email address.

### 🏢 ClientRepository
*Extends `BaseRepository<Client, NewClient, UpdateClient>`*
*   **`findActive(): Promise<Client[]>`**
    *   Returns only active clients, ordered by name.

### 🚀 ProjectRepository
*Extends `BaseRepository<Project, NewProject, UpdateProject>`*
*   **`findByClientId(clientId: number): Promise<Project[]>`**
    *   Returns all projects associated with a specific client.
*   **`findActive(): Promise<Project[]>`**
    *   Returns all active projects.

### ✅ TaskRepository
*Extends `BaseRepository<Task, NewTask, UpdateTask>`*
*   **`findByProjectId(projectId: number): Promise<Task[]>`**
    *   Returns all tasks belonging to a specific project.

### 📝 EntryRepository
*Extends `BaseRepository<Entry, NewEntry, UpdateEntry>`*
*   **`findByUserIdAndDate(userId: number, date: string): Promise<Entry[]>`**
    *   Finds entries for a specific user on a specific date.
*   **`findByUserIdAndDateRange(userId: number, startDate: string, endDate: string): Promise<Entry[]>`**
    *   Finds entries for a user within a given date range.

### 🔗 EntryAssignmentRepository
*Extends `BaseRepository<EntryAssignment, NewEntryAssignment, UpdateEntryAssignment>`*
*   **`findByEntryId(entryId: number): Promise<EntryAssignment[]>`**
    *   Returns all task assignments associated with a specific daily entry.

### 📌 AdminTaskAssignmentRepository
*Extends `BaseRepository<AdminTaskAssignment, NewAdminTaskAssignment, UpdateAdminTaskAssignment>`*
*   **`findByUserId(userId: number): Promise<AdminTaskAssignment[]>`**
    *   Returns all *active* task assignments for a specific user.
*   **`findByTaskId(taskId: number): Promise<AdminTaskAssignment[]>`**
    *   Returns all *active* assignments of a specific task.
*   **`revoke(id: number): Promise<void>`**
    *   Soft-deletes an assignment (sets `active: false` and `revoked_at` timestamp).

### 🔒 MonthLockRepository
*Extends `BaseRepository<MonthLock, NewMonthLock, UpdateMonthLock>`*
*   **`findByYearAndMonth(year: number, month: number): Promise<MonthLock | null>`**
    *   Checks if a specific month is locked.
*   **`isMonthLocked(year: number, month: number): Promise<boolean>`**
    *   Boolean helper that returns `true` if a lock exists.

---

### Usage Example

```typescript
// Import the repository
import { UserRepository } from '../db/repositories/UserRepository.js';

// Initialize
const userRepo = new UserRepository();

// Use generic method (inherited)
const newUser = await userRepo.create({ ... });

// Use specific method
const existingUser = await userRepo.findByEmail('test@example.com');
```
