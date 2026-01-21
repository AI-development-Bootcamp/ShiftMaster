# tasks-crud Specification

## Purpose
TBD - created by archiving change add-assignment-entity-crud. Update Purpose after archive.
## Requirements
### Requirement: Create Task API
The system SHALL allow admin users to create new tasks via POST /api/v1/tasks.

#### Scenario: Successfully create a task
- **Given**: An authenticated admin user
- **And**: Existing project with id "proj-123"
- **When**: POST /api/v1/tasks with:
  ```json
  {
    "name": "Frontend Development",
    "project_id": "proj-123"
  }
  ```
- **Then**: Response status is 201
- **And**: Response includes the created task with generated `task_id`

#### Scenario: Create task with optional due date
- **Given**: An authenticated admin user
- **When**: POST /api/v1/tasks with name, project_id, and end_date
- **Then**: Response status is 201
- **And**: Task is created with end_date set

#### Scenario: Create task with invalid project_id
- **Given**: An authenticated admin user
- **When**: POST /api/v1/tasks with non-existent project_id
- **Then**: Response status is 400
- **And**: Response error code is INVALID_REFERENCE

---

### Requirement: Update Task API
The system SHALL allow admin users to update existing tasks via PATCH /api/v1/tasks/:id.

#### Scenario: Successfully update a task
- **Given**: An authenticated admin user and existing task with id "task-123"
- **When**: PATCH /api/v1/tasks/task-123 with `{ "name": "Updated Task Name" }`
- **Then**: Response status is 200
- **And**: Response includes updated task data

#### Scenario: Update task due date
- **Given**: An authenticated admin user and existing task
- **When**: PATCH /api/v1/tasks/:id with `{ "end_date": "2026-03-15" }`
- **Then**: Response status is 200
- **And**: Task end_date is updated

---

### Requirement: Delete Task API (Soft Delete)
The system SHALL allow admin users to soft-delete tasks via DELETE /api/v1/tasks/:id.

#### Scenario: Successfully soft-delete a task
- **Given**: An authenticated admin user and existing active task with id "task-123"
- **When**: DELETE /api/v1/tasks/task-123
- **Then**: Response status is 200
- **And**: Task active flag is set to false

#### Scenario: Delete task does not affect assignments
- **Given**: An authenticated admin user and task with active assignments
- **When**: DELETE /api/v1/tasks/:id
- **Then**: Task is soft-deleted
- **And**: Related admin_task_assignments remain unchanged (may need separate cleanup)

---

