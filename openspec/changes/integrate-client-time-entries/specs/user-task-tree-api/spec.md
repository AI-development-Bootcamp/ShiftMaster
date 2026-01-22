# Spec: User Task Tree API

**Capability:** `user-task-tree-api`
**Related to:** `backend-server`

## ADDED Requirements

### Requirement: The system SHALL allow users to retrieve their assigned task hierarchy

The system SHALL allow users to fetch a hierarchical list of projects and tasks they are assigned to, for use in task selection interfaces.

#### Scenario: User fetches task tree with active assignments

**Given:**
- User has admin_task_assignment for:
  - Task 1 "Frontend Dev" in Project "Website Redesign" (Client: Acme Corp)
  - Task 2 "API Integration" in Project "Website Redesign"
  - Task 5 "Testing" in Project "Mobile App" (Client: TechCo)
- All assignments are active (active=true, revoked_at IS NULL)
- All projects and tasks are active

**When:**
- User sends GET /api/v1/me/task-tree

**Then:**
- Response status is 200 OK
- Response body contains:
  ```json
  {
    "success": true,
    "data": {
      "projects": [
        {
          "project_id": 1,
          "client_id": 1,
          "client_name": "Acme Corp",
          "manager_user_id": 20,
          "manager_name": "Jane Manager",
          "name": "Website Redesign",
          "description": "Complete website overhaul",
          "start_date": "2024-01-01",
          "end_date": "2024-06-30",
          "time_format_type": "start_end",
          "active": true,
          "tasks": [
            {
              "task_id": 1,
              "name": "Frontend Dev",
              "description": "React components",
              "start_date": "2024-01-15",
              "end_date": "2024-03-31"
            },
            {
              "task_id": 2,
              "name": "API Integration",
              "description": "Connect to backend",
              "start_date": "2024-02-01",
              "end_date": "2024-04-30"
            }
          ]
        },
        {
          "project_id": 2,
          "client_id": 2,
          "client_name": "TechCo",
          "manager_user_id": 21,
          "manager_name": "Bob Smith",
          "name": "Mobile App",
          "description": "iOS/Android app",
          "start_date": "2024-02-01",
          "end_date": "2024-08-31",
          "time_format_type": "sum",
          "active": true,
          "tasks": [
            {
              "task_id": 5,
              "name": "Testing",
              "description": "QA testing",
              "start_date": "2024-03-01",
              "end_date": null
            }
          ]
        }
      ]
    }
  }
  ```
- Projects sorted alphabetically by name
- Tasks within each project sorted alphabetically by name
- Only assigned tasks included

---

#### Scenario: User has no task assignments

**Given:**
- User has no admin_task_assignments (or all are revoked)

**When:**
- User sends GET /api/v1/me/task-tree

**Then:**
- Response status is 200 OK
- Response body contains:
  ```json
  {
    "success": true,
    "data": {
      "projects": []
    }
  }
  ```

---

#### Scenario: User fetches task tree excluding inactive projects

**Given:**
- User has assignments for:
  - Task 1 in Project "Active Project" (active=true)
  - Task 10 in Project "Archived Project" (active=false)
- includeInactive query param not provided (defaults to false)

**When:**
- User sends GET /api/v1/me/task-tree

**Then:**
- Response status is 200 OK
- Only "Active Project" is included in response
- "Archived Project" is excluded

---

#### Scenario: User fetches task tree including inactive projects

**Given:**
- User has assignments for:
  - Task 1 in Project "Active Project" (active=true)
  - Task 10 in Project "Archived Project" (active=false)

**When:**
- User sends GET /api/v1/me/task-tree?includeInactive=true

**Then:**
- Response status is 200 OK
- Both "Active Project" and "Archived Project" are included
- Each project has active field indicating status

---

#### Scenario: User filters task tree by specific project

**Given:**
- User has assignments in Project 1 and Project 2

**When:**
- User sends GET /api/v1/me/task-tree?projectId=1

**Then:**
- Response status is 200 OK
- Only Project 1 is included in response
- Project 2 is excluded
- All tasks from Project 1 that user is assigned to are included

---

#### Scenario: User with revoked task assignment does not see task

**Given:**
- User has admin_task_assignment for Task 1 with revoked_at='2025-12-01'

**When:**
- User sends GET /api/v1/me/task-tree

**Then:**
- Task 1 is not included in response
- Revoked assignments are excluded

---

### Requirement: The system MUST include project metadata for time format enforcement

The task tree MUST include each project's time_format_type so client can enforce correct time entry format.

#### Scenario: Client uses time_format_type to validate entries

**Given:**
- Project "Website Redesign" has time_format_type='start_end'
- Project "Mobile App" has time_format_type='sum'

**When:**
- User fetches task tree

**Then:**
- Each project in response includes time_format_type field
- Client can use this to show/hide appropriate time entry fields
- For 'start_end' projects: show start/end time pickers
- For 'sum' projects: show duration input

---

### Requirement: The system MUST optimize query performance for large datasets

The task tree endpoint MUST perform well even with users assigned to many projects/tasks.

#### Scenario: User assigned to 50+ tasks across 10+ projects

**Given:**
- User has 60 task assignments across 12 projects

**When:**
- User sends GET /api/v1/me/task-tree

**Then:**
- Response time < 500ms
- Query uses appropriate indexes:
  - admin_task_assignments(user_id, active)
  - tasks(project_id)
  - projects(active)
- Single query with JOINs (no N+1 queries)

---

## MODIFIED Requirements

None. This is a new capability.

---

## REMOVED Requirements

None. This is a new capability.
