# Spec: Absence Entries API

**Capability:** `absence-entries-api`
**Related to:** `backend-server`

## ADDED Requirements

### Requirement: The system SHALL allow users to create single-day absence entries

The system SHALL allow users to create absence entries for a single day with validation for month locks and absence type.

#### Scenario: User creates sick leave for single day

**Given:**
- User is authenticated
- Month 2026-01 is not locked

**When:**
- User sends POST /api/v1/absences with:
  ```json
  {
    "work_date": "2026-01-22",
    "absence_type": "sick",
    "description": "Flu symptoms"
  }
  ```

**Then:**
- Response status is 201 Created
- Response body contains:
  ```json
  {
    "success": true,
    "data": {
      "entries": [
        {
          "entry_id": 100,
          "user_id": 10,
          "entry_kind": "absence",
          "work_date": "2026-01-22",
          "start_time": null,
          "end_time": null,
          "absence_type": "sick",
          "description": "Flu symptoms",
          "attachment_path": null,
          "created_at": "...",
          "updated_at": "..."
        }
      ]
    }
  }
  ```
- Database entries table has new row with entry_kind='absence'
- No entry_assignments created

---

#### Scenario: User creates partial vacation with work time

**Given:**
- User is authenticated
- Month is not locked

**When:**
- User sends POST /api/v1/absences with:
  ```json
  {
    "work_date": "2026-01-22",
    "absence_type": "vacation_partial",
    "start_time": "09:00:00",
    "end_time": "13:00:00",
    "description": "Half day vacation"
  }
  ```

**Then:**
- Response status is 201 Created
- Entry created with absence_type='vacation_partial'
- start_time and end_time are set
- User can still create work assignments for same date (in separate flow)

---

### Requirement: The system SHALL support multi-day absence entries (date range)

The system SHALL allow users to create absence entries spanning multiple consecutive days, with the backend creating one entry per day.

#### Scenario: User creates 5-day vacation

**Given:**
- User is authenticated
- None of the dates 2026-02-10 through 2026-02-14 are locked

**When:**
- User sends POST /api/v1/absences with:
  ```json
  {
    "start_date": "2026-02-10",
    "end_date": "2026-02-14",
    "absence_type": "vacation",
    "description": "Annual leave"
  }
  ```

**Then:**
- Response status is 201 Created
- Response body contains array of 5 entries:
  ```json
  {
    "success": true,
    "data": {
      "entries": [
        { "entry_id": 101, "work_date": "2026-02-10", "absence_type": "vacation", ... },
        { "entry_id": 102, "work_date": "2026-02-11", "absence_type": "vacation", ... },
        { "entry_id": 103, "work_date": "2026-02-12", "absence_type": "vacation", ... },
        { "entry_id": 104, "work_date": "2026-02-13", "absence_type": "vacation", ... },
        { "entry_id": 105, "work_date": "2026-02-14", "absence_type": "vacation", ... }
      ]
    }
  }
  ```
- Database has 5 separate entry rows
- All entries have same description
- All entries have entry_kind='absence'

---

#### Scenario: User creates multi-day absence with one locked day

**Given:**
- Dates 2026-02-10, 2026-02-11, 2026-02-12 are not locked
- Date 2026-02-13 is in a locked month

**When:**
- User sends POST /api/v1/absences with start_date='2026-02-10', end_date='2026-02-13'

**Then:**
- Response status is 400 Bad Request
- Response body contains:
  ```json
  {
    "success": false,
    "error": {
      "message": "Month is locked, cannot create absence",
      "code": "MONTH_LOCKED",
      "details": { "year": 2026, "month": 2, "locked_date": "2026-02-13" }
    }
  }
  ```
- No entries created (all-or-nothing)

---

### Requirement: The system SHALL allow users to retrieve absence entries by date range

The system SHALL allow users to fetch their absence entries for a specific date range.

#### Scenario: User fetches absences for current month

**Given:**
- User has 2 absence entries in January 2026 (sick, vacation)
- User has 3 work entries in January 2026 (should be excluded)

**When:**
- User sends GET /api/v1/absences?startDate=2026-01-01&endDate=2026-01-31

**Then:**
- Response status is 200 OK
- Response body contains:
  ```json
  {
    "success": true,
    "data": {
      "absences": [
        {
          "entry_id": 50,
          "user_id": 10,
          "user_name": "John Doe",
          "entry_kind": "absence",
          "work_date": "2026-01-15",
          "absence_type": "sick",
          "description": "Flu",
          "attachment_path": null,
          "created_at": "...",
          "updated_at": "..."
        },
        {
          "entry_id": 51,
          "user_id": 10,
          "entry_kind": "absence",
          "work_date": "2026-01-20",
          "absence_type": "vacation",
          "description": "Day off",
          "attachment_path": null,
          "created_at": "...",
          "updated_at": "..."
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 50,
        "total": 2,
        "totalPages": 1
      }
    }
  }
  ```
- Only absence entries returned (work entries excluded)
- Entries sorted by work_date descending

---

#### Scenario: User filters absences by type

**Given:**
- User has absence entries: 2 sick, 3 vacation, 1 reserve

**When:**
- User sends GET /api/v1/absences?absenceType=vacation

**Then:**
- Response status is 200 OK
- Only vacation entries returned (3 entries)
- Other absence types excluded

---

### Requirement: The system MUST implement upsert logic for existing absence entries

When a user creates an absence entry for a date that already has an entry, the system MUST update the existing entry.

#### Scenario: User updates existing absence entry

**Given:**
- User has absence entry for work_date='2026-01-22' with entry_id=100, absence_type='sick'

**When:**
- User sends POST /api/v1/absences with:
  ```json
  {
    "work_date": "2026-01-22",
    "absence_type": "vacation",
    "description": "Changed to vacation day"
  }
  ```

**Then:**
- Existing entry (entry_id=100) is updated
- absence_type changed from 'sick' to 'vacation'
- description updated
- updated_at timestamp changed
- Response status is 201 Created
- Response contains updated entry

---

### Requirement: The system MUST validate absence type enum

The system MUST accept only valid absence types in the API.

#### Scenario: User creates absence with invalid type

**Given:**
- User is authenticated

**When:**
- User sends POST /api/v1/absences with absence_type='invalid_type'

**Then:**
- Response status is 400 Bad Request
- Response body contains:
  ```json
  {
    "success": false,
    "error": {
      "message": "Invalid absence type",
      "code": "VALIDATION_ERROR",
      "details": {
        "field": "absence_type",
        "allowed_values": ["sick", "vacation", "vacation_partial", "reserve", "other"]
      }
    }
  }
  ```
- No entry created

---

## MODIFIED Requirements

None. This is a new capability.

---

## REMOVED Requirements

None. This is a new capability.
