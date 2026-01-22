# Spec Delta: Unified Entries API

**Capability:** `unified-entries-api`
**Change:** `add-clock-time-tracking`
**Type:** New capability

## ADDED Requirements

### Requirement: Unified timeline endpoint

The timeline endpoint MUST return both work entries and absence entries in a single unified response.

#### Scenario: User fetches personal timeline

**Given** user is authenticated
**When** GET `/api/v1/entries/timeline` is called
**Then** backend queries `entries` table for user's entries
**And** response includes both `entry_kind='work'` and `entry_kind='absence'` entries
**And** entries are grouped by `work_date`
**And** entries are sorted by `work_date` descending (most recent first)

#### Scenario: Timeline includes task and project details for work entries

**Given** user has work entries with task assignments
**When** GET `/api/v1/entries/timeline` is called
**Then** response includes `entry_assignments` joined with task and project names
**And** each assignment shows `task_name`, `project_name`, `location`, and time details

#### Scenario: Timeline includes absence details

**Given** user has absence entries
**When** GET `/api/v1/entries/timeline` is called
**Then** response includes `absence_type` for absence entries
**And** absence entries have no task assignments (unless `vacation_partial`)

---

### Requirement: Date range filtering

The timeline MUST support filtering entries by start_date and end_date query parameters.

#### Scenario: User filters timeline by date range

**Given** user is authenticated
**When** GET `/api/v1/entries/timeline?start_date=2026-01-01&end_date=2026-01-31` is called
**Then** backend returns only entries with `work_date` between start_date and end_date (inclusive)
**And** response follows same grouping and sorting rules

#### Scenario: Timeline defaults to current month if no dates provided

**Given** user is authenticated
**When** GET `/api/v1/entries/timeline` is called without date parameters
**Then** backend defaults to current month (first day to last day)
**And** response includes all entries for current month

---

### Requirement: Date grouping with metadata

The timeline response MUST group entries by work_date and include day-level metadata like total_work_minutes.

#### Scenario: Timeline response includes daily totals

**Given** user has multiple work entries on same date
**When** GET `/api/v1/entries/timeline` is called
**Then** response groups entries by `work_date`
**And** each date group includes `total_work_minutes` (sum of all work entry durations)
**And** each date group includes separate arrays: `entries` (work) and `absences`

#### Scenario: Timeline calculates work duration correctly

**Given** user has entry with `start_time=09:00` and `end_time=17:00`
**When** GET `/api/v1/entries/timeline` is called
**Then** duration calculated as `(end_time - start_time)` = 480 minutes
**And** `total_work_minutes` includes this duration

#### Scenario: Timeline handles incomplete entries (active timer)

**Given** user has entry with `start_time` but no `end_time` (active timer)
**When** GET `/api/v1/entries/timeline` is called
**Then** entry included in response with `end_time=null`
**And** entry marked as `is_active=true` in response
**And** `total_work_minutes` excludes incomplete entry

---

### Requirement: Admin access to user timelines

The system SHALL allow admins to fetch timeline data for any user via user_id query parameter.

#### Scenario: Admin fetches another user's timeline

**Given** admin is authenticated
**When** GET `/api/v1/entries/timeline?user_id=<target-uuid>` is called
**Then** backend validates requesting user has `role='admin'`
**And** response returns timeline for target user
**And** response format identical to personal timeline

#### Scenario: Regular user cannot view other's timeline

**Given** regular user is authenticated
**When** GET `/api/v1/entries/timeline?user_id=<other-uuid>` is called
**Then** backend returns 403 Forbidden
**And** error message indicates admin access required

---

### Requirement: Frontend-friendly response format

The timeline response format MUST support efficient frontend rendering with day-grouped card display.

#### Scenario: Timeline returns structured response

**Given** user has entries for multiple dates
**When** GET `/api/v1/entries/timeline` is called
**Then** response follows this structure:
```json
{
  "success": true,
  "data": {
    "timeline": [
      {
        "work_date": "2026-01-22",
        "total_work_minutes": 480,
        "entries": [/* work entry objects */],
        "absences": [/* absence entry objects */]
      }
    ]
  }
}
```

#### Scenario: Work entry includes all assignment details

**Given** user has work entry with task assignment
**Then** each work entry in timeline includes:
```json
{
  "entry_id": 123,
  "entry_kind": "work",
  "work_date": "2026-01-22",
  "start_time": "09:00:00",
  "end_time": "17:00:00",
  "description": "Backend work",
  "is_active": false,
  "assignments": [
    {
      "entry_assignment_id": 789,
      "task_id": 456,
      "task_name": "API Development",
      "project_id": 10,
      "project_name": "TimeTracker",
      "location": "Office",
      "start_time": "09:00:00",
      "end_time": "17:00:00",
      "duration_minutes": 480
    }
  ]
}
```

#### Scenario: Absence entry includes absence details

**Given** user has absence entry
**Then** each absence entry in timeline includes:
```json
{
  "entry_id": 124,
  "entry_kind": "absence",
  "work_date": "2026-01-21",
  "absence_type": "sick",
  "description": "Doctor appointment",
  "attachment_path": "/uploads/absences/124/note.pdf",
  "start_time": null,
  "end_time": null
}
```

---

### Requirement: Mobile performance optimization

The timeline query implementation MUST be optimized for fast loading on mobile devices.

#### Scenario: Timeline uses single query with joins

**Given** backend processes timeline request
**Then** backend executes single SQL query with LEFT JOINs:
- `entries` → `entry_assignments` → `tasks` → `projects`
**And** query includes WHERE clause for user_id and date range
**And** query uses ORDER BY `work_date DESC`

#### Scenario: Timeline supports pagination for large ranges

**Given** user requests timeline for large date range (> 3 months)
**When** GET `/api/v1/entries/timeline?start_date=2025-01-01&end_date=2026-01-31` is called
**Then** backend recommends adding `limit` and `offset` parameters
**Or** frontend fetches in chunks (monthly batches)
**And** response includes `pagination` metadata if implemented

---

### Requirement: Month lock indication

The timeline response MUST include is_locked flags indicating which entries are in locked months.

#### Scenario: Timeline marks locked entries

**Given** user has entries in locked month
**When** GET `/api/v1/entries/timeline` is called
**Then** backend checks `month_locks` table for each entry's month
**And** response includes `is_locked` flag for each entry
**And** frontend disables edit/delete actions for locked entries

#### Scenario: Timeline includes lock information

**Given** month 2026-01 is locked
**When** GET `/api/v1/entries/timeline` returns entries for January 2026
**Then** each entry has `is_locked=true`
**And** response may include `locked_by` and `locked_at` metadata per month
