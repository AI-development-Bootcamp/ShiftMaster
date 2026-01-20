# Final Database Schema (Edited)

This document reflects the **final agreed changes** to the database design.

---

## Shared Enums / Types

- **user_role**: `admin | regular`
- **project_time_format_type**: `sum | start_end`
- **entry_kind**: `work | absence`
- **absence_type**: `sick | vacation | vacation_partial | reserve | other`
- **work_location**: `Office | Client | Home`

---

## 1. users

Employees and admins.

| Field         | Type        | Key / FK | Restrictions    |
| ------------- | ----------- | -------- | --------------- |
| user_id       | UUID        | PK       |                 |
| full_name     | TEXT        |          | required        |
| email         | TEXT        | UNIQUE   | required        |
| password_hash | TEXT        |          | required        |
| role          | user_role   |          | admin / regular |
| job_title     | TEXT        |          |                 |
| active        | BOOLEAN     |          | soft delete     |
| created_at    | TIMESTAMPTZ |          |                 |

**Relations**

- users **1 → many** entries
- users **1 → many** projects (manager)
- users (admin) **1 → many** month_locks
- users (admin) **1 → many** admin_task_assignments

---

## 2. clients

| Field        | Type        | Key / FK | Restrictions |
| ------------ | ----------- | -------- | ------------ |
| client_id    | BIGINT      | PK       |              |
| name         | TEXT        |          | required     |
| contact_info | TEXT        |          | optional     |
| active       | BOOLEAN     |          | soft delete  |
| created_at   | TIMESTAMPTZ |          |              |

**Relations**

- clients **1 → many** projects

---

## 3. projects

| Field            | Type                     | Key / FK               | Restrictions                   |
| ---------------- | ------------------------ | ---------------------- | ------------------------------ |
| project_id       | BIGINT                   | PK                     |                                |
| client_id        | BIGINT                   | FK → clients.client_id | required                       |
| manager_user_id  | UUID                     | FK → users.user_id     | required                       |
| name             | TEXT                     |                        | required                       |
| description      | TEXT                     |                        | optional                       |
| start_date       | DATE                     |                        | required                       |
| end_date         | DATE                     |                        | optional, must be ≥ start_date |
| time_format_type | project_time_format_type |                        | required                       |
| active           | BOOLEAN                  |                        | soft delete                    |
| created_at       | TIMESTAMPTZ              |                        |                                |

**Relations**

- projects **many → 1** clients
- projects **many → 1** users (manager)
- projects **1 → many** tasks

---

## 4. tasks

| Field       | Type        | Key / FK                 | Restrictions                   |
| ----------- | ----------- | ------------------------ | ------------------------------ |
| task_id     | BIGINT      | PK                       |                                |
| project_id  | BIGINT      | FK → projects.project_id | required                       |
| name        | TEXT        |                          | required                       |
| description | TEXT        |                          | optional                       |
| start_date  | DATE        |                          | optional                       |
| end_date    | DATE        |                          | optional, must be ≥ start_date |
| created_at  | TIMESTAMPTZ |                          |                                |

**Relations**

- tasks **many → 1** projects
- tasks **1 → many** entry_assignments
- tasks **1 → many** admin_task_assignments

---

## 5. admin_task_assignments

(**Renamed from `task_user_assignments`** – clearly admin-owned)

Defines which **tasks an admin assigned to a user**.
Prevents duplicate assignment of the same user to the same task.

| Field                    | Type        | Key / FK           | Restrictions  |
| ------------------------ | ----------- | ------------------ | ------------- |
| admin_task_assignment_id | BIGINT      | PK                 |               |
| user_id                  | UUID        | FK → users.user_id | required      |
| task_id                  | BIGINT      | FK → tasks.task_id | required      |
| assigned_by              | UUID        | FK → users.user_id | must be admin |
| assigned_at              | TIMESTAMPTZ |                    |               |
| active                   | BOOLEAN     |                    | default true  |
| revoked_at               | TIMESTAMPTZ |                    | optional      |

**Relations**

- users **1 → many** admin_task_assignments
- tasks **1 → many** admin_task_assignments
- users (admin) **1 → many** admin_task_assignments (assigned_by)

**Restrictions**

- **UNIQUE (user_id, task_id)** → admin cannot assign same user to same task twice
- only admin users may create/update these records

---

## 6. entries

(Unified table for work + absence, **one row = one calendar day**)

| Field            | Type         | Key / FK           | Restrictions                        |
| ---------------- | ------------ | ------------------ | ----------------------------------- |
| entry_id         | BIGINT       | PK                 |                                     |
| user_id          | UUID         | FK → users.user_id | required                            |
| entry_kind       | entry_kind   |                    | work / absence                      |
| work_date        | DATE         |                    | required (single day only)          |
| start_time       | TIME         |                    | optional                            |
| end_time         | TIME         |                    | optional                            |
| description      | TEXT         |                    | optional                            |
| absence_type     | absence_type |                    | required only if entry_kind=absence |
| attachment_path  | TEXT         |                    | optional                            |
| created_at       | TIMESTAMPTZ  |                    |                                     |
| updated_at       | TIMESTAMPTZ  |                    |                                     |
| last_modified_by | UUID         | FK → users.user_id | optional                            |
| last_modified_at | TIMESTAMPTZ  |                    |                                     |

**Important absence behavior**

- Vacation range selected in UI → backend **creates multiple entries**
  - e.g. 5-day vacation → 5 rows in `entries`, each with its own `work_date`
- `vacation_partial` entries **may also have work assignments**
- Other absence types **must not have work assignments**

**Relations**

- users **1 → many** entries
- entries **1 → many** entry_assignments

**Restrictions**

- If month is locked → entry is read-only

---

## 7. entry_assignments

(Task-level work lines under an entry)

| Field               | Type          | Key / FK              | Restrictions         |
| ------------------- | ------------- | --------------------- | -------------------- |
| entry_assignment_id | BIGINT        | PK                    |                      |
| entry_id            | BIGINT        | FK → entries.entry_id | required             |
| task_id             | BIGINT        | FK → tasks.task_id    | required             |
| location            | work_location |                       | required             |
| start_time          | TIME          |                       | for start_end format |
| end_time            | TIME          |                       | for start_end format |
| duration_minutes    | INT           |                       | for sum format       |
| created_at          | TIMESTAMPTZ   |                       |                      |
| updated_at          | TIMESTAMPTZ   |                       |                      |

**Relations**

- entries **1 → many** entry_assignments
- tasks **1 → many** entry_assignments

**Restrictions**

- Entry’s user must have an **active admin_task_assignment** for the task
- Time fields enforced by project.time_format_type
- Not allowed if entry is absence (except vacation_partial)
- Not allowed if month is locked

---

## 8. month_locks

| Field       | Type        | Key / FK           | Restrictions  |
| ----------- | ----------- | ------------------ | ------------- |
| lock_id     | BIGINT      | PK                 |               |
| year        | INT         |                    | required      |
| month       | INT         |                    | 1–12          |
| locked_at   | TIMESTAMPTZ |                    |               |
| locked_by   | UUID        | FK → users.user_id | must be admin |
| unlocked_at | TIMESTAMPTZ |                    | optional      |

**Relations**

- users (admin) **1 → many** month_locks

**Restrictions**

- **UNIQUE (year, month)** → same year+month cannot exist twice
- If `unlocked_at` is null → month is locked
- Locked month → entries & entry_assignments are read-only

---

## Relationship Summary

- clients **1 → \* projects**
- projects **1 → \* tasks**
- users **1 → \* projects** (manager)
- users **1 → \* entries**
- entries **1 → \* entry_assignments**
- tasks **1 → \* entry_assignments**
- users **↔ tasks** via **admin_task_assignments**
- users (admin) **1 → \* month_locks**

---

## Final Design Guarantees

- ✅ Admin-only task assignment with no duplicates
- ✅ One DB row per user per calendar day
- ✅ Partial vacation supports mixed work + absence
- ✅ Strong month locking by unique (year, month)
- ✅ Clean, predictable reporting model

If you want next:

- OpenSpec **validation rules**
- API request/response contracts
- Migration checklist from old schema
