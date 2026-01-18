# User Stories

## Epic 1 — Authentication & Roles

### US-1.1 Register / Create user (Admin)

As an **admin**, I want to create a user account with role and email, so that employees can use the system.

**Acceptance Criteria**

- Can create user with required fields.
- Email must be unique.
- New user is active by default.

### US-1.2 Login (User)

As a **user**, I want to log in using my credentials, so I can access my reporting features.

**Acceptance Criteria**

- Invalid credentials show an error.
- Auth session/token is created on success.

### US-1.3 Role-based access

As a **system**, I want to restrict admin-only actions, so regular users cannot manage assignments or locks.

**Acceptance Criteria**

- Only admins can lock months.
- Only admins can assign users to tasks.

---

## Epic 2 — Master Data Management (Clients / Projects / Tasks)

### US-2.1 Create client (Admin)

As an **admin**, I want to create a client, so projects can be attached to it.

**Acceptance Criteria**

- Client name is required.
- Client is active by default.

### US-2.2 Deactivate client (Admin)

As an **admin**, I want to deactivate a client, so it can’t be used for new reporting while history remains.

**Acceptance Criteria**

- Deactivated client cannot be selected for new entries.
- Existing history remains visible in reports.

### US-2.3 Create project (Admin)

As an **admin**, I want to create a project with dates, manager, and time format, so reporting follows a consistent rule.

**Acceptance Criteria**

- Must select client + manager.
- time_format_type is required (sum/start_end).
- end_date cannot be before start_date.

### US-2.4 Deactivate project (Admin)

As an **admin**, I want to deactivate a project, so users cannot report on it going forward.

**Acceptance Criteria**

- Inactive project is not selectable.
- Existing entries remain intact.

### US-2.5 Create task (Admin)

As an **admin**, I want to create tasks under a project with optional dates and description, so users can report on specific work items.

**Acceptance Criteria**

- Task must belong to a project.
- end_date cannot be before start_date.

### US-2.6 Enforce task availability by date (System)

As a **system**, I want to prevent selecting tasks outside their date range, so reporting matches planning.

**Acceptance Criteria**

- Task not selectable if work_date is outside task dates (when provided).

---

## Epic 3 — Admin assigns tasks to users (Visibility/Permission)

### US-3.1 Assign task to user (Admin)

As an **admin**, I want to assign a task to a user, so the user can see and report on that task.

**Acceptance Criteria**

- Assignment stores assigned_by and assigned_at.
- Assignment is active by default.
- Duplicate (user, task) is rejected.

### US-3.2 Revoke task assignment (Admin)

As an **admin**, I want to revoke a user’s task assignment, so they can no longer report on it.

**Acceptance Criteria**

- Revoked assignment no longer appears for user selection.
- Existing history remains visible.

### US-3.3 View assigned tasks (User)

As a **user**, I want to see only tasks assigned to me, so task selection is simple and valid.

**Acceptance Criteria**

- Task list includes only active assignments.
- Tasks from inactive projects/clients do not appear.

---

## Epic 4 — Daily Entries (Work + Absence)

### US-4.1 Create daily work entry (User)

As a **user**, I want to create an entry for a work day, so I can report my hours.

**Acceptance Criteria**

- Exactly one entry per user per day (no duplicates).
- Entry respects month lock rules.

### US-4.2 Add entry-level day span (User)

As a **user**, I want to optionally add start/end time for the day, so I can record my overall working span.

**Acceptance Criteria**

- If both times exist, end_time > start_time.

### US-4.3 Create absence entry for a single day (User)

As a **user**, I want to mark a day as sick/vacation/reserve/other, so the system knows I’m absent.

**Acceptance Criteria**

- entry_kind=absence with absence_type required.
- For non-partial absences, entry has no work line items.

### US-4.4 Create vacation range (User)

As a **user**, I want to select a date range for vacation, so the system creates daily absence records automatically.

**Acceptance Criteria**

- Backend creates one Entry per day in the range.
- Does not create duplicates for days that already have an entry (or follows merge rule).
- All created entries obey month lock.

### US-4.5 Create partial vacation day (User)

As a **user**, I want to mark a day as vacation_partial, so I can still report work for the remaining time.

**Acceptance Criteria**

- entry_kind=absence + absence_type=vacation_partial.
- Entry allows work line items.

---

## Epic 5 — Entry Line Items (Work splits per task)

### US-5.1 Add a task line to an entry (User)

As a **user**, I want to add a task line item to my entry, so I can split my day across tasks.

**Acceptance Criteria**

- Task must be assigned to user (admin_task_assignments active).
- Location is required.
- Must respect project time format type.
- Must respect month lock.

### US-5.2 Enforce time format: sum projects (System)

As a **system**, I want to require duration-only for sum-format projects, so time is consistent.

**Acceptance Criteria**

- duration_minutes required and > 0.
- start/end are not allowed.

### US-5.3 Enforce time format: start_end projects (System)

As a **system**, I want to require start/end times for start_end projects, so time is consistent.

**Acceptance Criteria**

- start_time and end_time required.
- end_time > start_time.

### US-5.4 Prevent duplicate task lines per entry (System)

As a **system**, I want to prevent adding the same task twice in one entry, so the UI remains clean.

**Acceptance Criteria**

- Reject if (entry_id, task_id) already exists.

### US-5.5 Edit a task line (User)

As a **user**, I want to edit a task line item, so I can correct mistakes.

**Acceptance Criteria**

- Only allowed if month not locked.
- Same permission/time-format rules apply.

### US-5.6 Delete a task line (User)

As a **user**, I want to delete a task line item, so I can remove incorrect reporting.

**Acceptance Criteria**

- Only allowed if month not locked.

---

## Epic 6 — Month Locking (Admin)

### US-6.1 Lock month (Admin)

As an **admin**, I want to lock a month, so users can no longer edit entries in that month.

**Acceptance Criteria**

- Unique (year, month) enforced; cannot lock twice.
- All entries in that month become read-only.

### US-6.2 Unlock month (Admin)

As an **admin**, I want to unlock a month, so edits are possible again.

**Acceptance Criteria**

- Unlock operation marks the lock inactive (e.g., unlocked_at set) or removes it (your choice).

### US-6.3 Prevent edits in locked month (System)

As a **system**, I want to block any write operation on locked months, so data is final.

**Acceptance Criteria**

- No create/update/delete of entries or line items in locked months.

---

## Epic 7 — Reporting / Retrieval

### US-7.1 View my monthly entries (User)

As a **user**, I want to view all my entries for a selected month, so I can review my reporting.

**Acceptance Criteria**

- Shows daily entries and their task lines.
- Shows absence days clearly.

### US-7.2 View my assigned tasks (User)

As a **user**, I want to retrieve my assigned tasks list, so I can pick from valid tasks when reporting.

**Acceptance Criteria**

- Only active assignments are returned.
- Tasks outside date range or inactive projects/clients are excluded.

### US-7.3 Admin monthly overview (Admin)

As an **admin**, I want to view all users’ entries for a month, so I can validate and approve reporting.

**Acceptance Criteria**

- Can filter by user, client, project, task.
- Indicates locked/unlocked status for the month.

---
