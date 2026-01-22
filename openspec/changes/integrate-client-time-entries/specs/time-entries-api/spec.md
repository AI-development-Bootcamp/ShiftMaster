# Spec: Time Entries API

**Capability:** `time-entries-api`
**Related to:** `backend-server`

## ADDED Requirements

### Requirement: The system SHALL allow users to create work entries with task assignments

The system SHALL allow users to create work entries that include one or more task assignments, with validation for month locks, task assignments, and time format requirements.

#### Scenario: User creates work entry with valid data

**Given:**
- User is authenticated with valid JWT token
- User has admin_task_assignment for task_id=1 (active, not revoked)
- Project for task_id=1 has time_format_type='start_end'
- Month 2026-01 is not locked

**When:**
- User sends POST /api/v1/time-entries with:
  ```json
  {
    "work_date": "2026-01-22",
    "start_time": "09:00:00",
    "end_time": "17:00:00",
    "description": "Frontend development work",
    "assignments": [
      {
        "task_id": 1,
        "location": "Office",
        "start_time": "09:00:00",
        "end_time": "17:00:00"
      }
    ]
  }
  ```

**Then:**
- Response status is 201 Created
- Response body contains:
  - entry_id (number)
  - user_id (from JWT token)
  - entry_kind='work'
  - work_date='2026-01-22'
  - start_time='09:00:00'
  - end_time='17:00:00'
  - description='Frontend development work'
  - created_at (timestamp)
  - updated_at (timestamp)
  - assignments array with entry_assignment_id, task details
- Database entries table has new row
- Database entry_assignments table has new row

---

#### Scenario: User creates work entry when one already exists for that date (upsert)

**Given:**
- User already has entry for work_date='2026-01-22' with entry_id=100
- Month is not locked

**When:**
- User sends POST /api/v1/time-entries with work_date='2026-01-22'

**Then:**
- Existing entry (entry_id=100) is updated
- Old entry_assignments are deleted
- New entry_assignments are created
- Response status is 201 Created
- Response contains updated entry

---

#### Scenario: User creates work entry for locked month

**Given:**
- Month 2026-01 is locked (month_locks has active row)

**When:**
- User sends POST /api/v1/time-entries with work_date='2026-01-15'

**Then:**
- Response status is 400 Bad Request
- Response body contains:
  ```json
  {
    "success": false,
    "error": {
      "message": "Month is locked, cannot create entry",
      "code": "MONTH_LOCKED",
      "details": { "year": 2026, "month": 1 }
    }
  }
  ```
- No entry created in database

---

#### Scenario: User creates work entry for unassigned task

**Given:**
- User does not have admin_task_assignment for task_id=999

**When:**
- User sends POST /api/v1/time-entries with assignment for task_id=999

**Then:**
- Response status is 400 Bad Request
- Response body contains:
  ```json
  {
    "success": false,
    "error": {
      "message": "User is not assigned to task",
      "code": "TASK_NOT_ASSIGNED",
      "details": { "task_id": 999 }
    }
  }
  ```
- No entry created

---

#### Scenario: User creates work entry with wrong time format

**Given:**
- Project for task_id=1 has time_format_type='start_end'
- User provides assignment with duration_minutes instead of start/end times

**When:**
- User sends POST /api/v1/time-entries with:
  ```json
  {
    "work_date": "2026-01-22",
    "assignments": [
      { "task_id": 1, "location": "Office", "duration_minutes": 480 }
    ]
  }
  ```

**Then:**
- Response status is 400 Bad Request
- Response body contains:
  ```json
  {
    "success": false,
    "error": {
      "message": "Time format mismatch: project requires start_end format",
      "code": "TIME_FORMAT_MISMATCH",
      "details": { "project_id": 1, "required_format": "start_end" }
    }
  }
  ```

---

#### Scenario: Unauthenticated user attempts to create entry

**Given:**
- No Authorization header provided

**When:**
- User sends POST /api/v1/time-entries

**Then:**
- Response status is 401 Unauthorized
- No entry created

---

### Requirement: The system SHALL allow users to retrieve work entries by date range

The system SHALL allow users to fetch their work entries for a specific date range, with entries including their task assignments.

#### Scenario: User fetches entries for current month

**Given:**
- User has 3 work entries in January 2026
- User has 1 absence entry in January 2026 (should be excluded)

**When:**
- User sends GET /api/v1/time-entries?startDate=2026-01-01&endDate=2026-01-31

**Then:**
- Response status is 200 OK
- Response body contains:
  ```json
  {
    "success": true,
    "data": {
      "entries": [
        {
          "entry_id": 1,
          "user_id": 10,
          "user_name": "John Doe",
          "entry_kind": "work",
          "work_date": "2026-01-15",
          "start_time": "09:00:00",
          "end_time": "17:00:00",
          "description": "...",
          "created_at": "...",
          "updated_at": "...",
          "assignments": [
            {
              "entry_assignment_id": 1,
              "task_id": 1,
              "task_name": "Frontend Development",
              "project_name": "Website Redesign",
              "client_name": "Acme Corp",
              "location": "Office",
              "start_time": "09:00:00",
              "end_time": "17:00:00",
              "duration_minutes": null
            }
          ]
        },
        // ... 2 more entries
      ],
      "pagination": {
        "page": 1,
        "limit": 50,
        "total": 3,
        "totalPages": 1
      }
    }
  }
  ```
- Only work entries returned (absence entries excluded)
- Entries sorted by work_date descending

---

#### Scenario: User fetches entries with no results

**Given:**
- User has no entries in February 2026

**When:**
- User sends GET /api/v1/time-entries?startDate=2026-02-01&endDate=2026-02-28

**Then:**
- Response status is 200 OK
- Response body contains:
  ```json
  {
    "success": true,
    "data": {
      "entries": [],
      "pagination": { "page": 1, "limit": 50, "total": 0, "totalPages": 0 }
    }
  }
  ```

---

#### Scenario: User cannot fetch other users' entries

**Given:**
- User A (user_id=10) is authenticated
- User B (user_id=20) has entries

**When:**
- User A sends GET /api/v1/time-entries?userId=20

**Then:**
- Query parameter userId is ignored (non-admin users can only see their own)
- Only User A's entries are returned
- Response status is 200 OK

---

### Requirement: The backend MUST implement layered architecture for entry operations

The backend MUST implement a layered architecture (Routes → Controllers → Services → Models) to ensure separation of concerns and testability.

#### Scenario: Service layer enforces business rules

**Given:**
- entryService.createWorkEntry() is called

**When:**
- Service executes

**Then:**
- Service calls monthLockService.checkLocked() before creating entry
- Service calls taskAssignmentService.verifyUserAssignedToTasks()
- Service calls timeFormatService.validateAssignmentTimeFormat()
- Service calls Entry.create() only after all validations pass
- Service wraps entry + assignments creation in transaction

---

#### Scenario: Transaction rolls back on assignment creation failure

**Given:**
- Entry creation succeeds
- EntryAssignment creation fails (e.g., database error)

**When:**
- entryService.createWorkEntry() executes

**Then:**
- Transaction is rolled back
- Entry is not persisted to database
- Error is thrown to controller
- Controller returns 500 Internal Server Error

---

## MODIFIED Requirements

None. This is a new capability.

---

## REMOVED Requirements

None. This is a new capability.
