# month-locks Specification Delta

## MODIFIED Requirements

### Requirement: Month lock data model uses delete-on-unlock

The system MUST use row deletion for unlocking months instead of setting an `unlocked_at` timestamp.

#### Scenario: Locking a month creates a row
- **Given** the month (year=2024, month=3) is not locked
- **When** an admin locks the month
- **Then** a new row is created in `month_locks` with year=2024, month=3, locked_at=now(), locked_by=admin_id
- **And** the row does NOT have an `unlocked_at` column

#### Scenario: Unlocking a month deletes the row
- **Given** the month (year=2024, month=3) is locked (row exists in month_locks)
- **When** an admin unlocks the month
- **Then** the row is DELETED from `month_locks`
- **And** the month no longer appears in `GET /month-locks?year=2024` response

#### Scenario: Checking if a month is locked
- **Given** the system needs to check if a month is locked
- **When** querying `month_locks` for (year, month)
- **Then** if a row exists, the month is locked
- **And** if no row exists, the month is unlocked

### Requirement: MonthLock type has no unlocked_at field

The shared `MonthLock` interface MUST NOT include an `unlocked_at` field.

#### Scenario: MonthLock interface structure
- **Given** the shared types package
- **When** defining the `MonthLock` interface
- **Then** it MUST have fields: `lock_id`, `year`, `month`, `locked_at`, `locked_by`
- **And** it MUST NOT have an `unlocked_at` field
