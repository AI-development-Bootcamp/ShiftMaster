# projects-crud Specification

## Purpose
TBD - created by archiving change add-assignment-entity-crud. Update Purpose after archive.
## Requirements
### Requirement: Create Project API
The system SHALL allow admin users to create new projects via POST /api/v1/projects.

#### Scenario: Successfully create a project
- **Given**: An authenticated admin user
- **And**: Existing client with id "client-123" and user with id "manager-456"
- **When**: POST /api/v1/projects with:
  ```json
  {
    "name": "Website Redesign",
    "client_id": "client-123",
    "manager_user_id": "manager-456",
    "start_date": "2026-02-01"
  }
  ```
- **Then**: Response status is 201
- **And**: Response includes the created project with generated `project_id`
- **And**: `time_format_type` defaults to "sum"

#### Scenario: Create project with invalid client_id
- **Given**: An authenticated admin user
- **When**: POST /api/v1/projects with non-existent client_id
- **Then**: Response status is 400
- **And**: Response error code is INVALID_REFERENCE

#### Scenario: Create project with all optional fields
- **Given**: An authenticated admin user
- **When**: POST /api/v1/projects with all fields including end_date, description, and time_format_type
- **Then**: Response status is 201
- **And**: All provided values are stored

---

### Requirement: Update Project API
The system SHALL allow admin users to update existing projects via PATCH /api/v1/projects/:id.

#### Scenario: Successfully update a project
- **Given**: An authenticated admin user and existing project with id "proj-123"
- **When**: PATCH /api/v1/projects/proj-123 with `{ "name": "Updated Name" }`
- **Then**: Response status is 200
- **And**: Response includes updated project data

#### Scenario: Update project manager
- **Given**: An authenticated admin user and existing project
- **When**: PATCH /api/v1/projects/:id with `{ "manager_user_id": "new-manager-id" }`
- **Then**: Response status is 200
- **And**: Project manager is updated

---

### Requirement: Delete Project API (Soft Delete with Cascade)
The system SHALL allow admin users to soft-delete projects via DELETE /api/v1/projects/:id. Related tasks MUST also be soft-deleted.

#### Scenario: Successfully soft-delete a project
- **Given**: An authenticated admin user and existing active project with id "proj-123"
- **And**: Project has 3 related tasks
- **When**: DELETE /api/v1/projects/proj-123
- **Then**: Response status is 200
- **And**: Project active flag is set to false
- **And**: All related tasks have active=false

---

