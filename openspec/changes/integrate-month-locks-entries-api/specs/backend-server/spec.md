## ADDED Requirements

### Requirement: Month Locks API Endpoints

The backend SHALL expose REST endpoints for managing month locks, restricted to admin users only.

#### Scenario: Admin lists month locks for a year

- **GIVEN** an authenticated admin user
- **WHEN** a GET request is made to `/api/v1/month-locks?year=2026`
- **THEN** the response contains an array of active MonthLock records for that year
- **AND** only locks where `unlocked_at` is null are returned
- **AND** the response status is 200

#### Scenario: Admin batch updates month locks

- **GIVEN** an authenticated admin user
- **WHEN** a PUT request is made to `/api/v1/month-locks/batch` with `{ year: 2026, operations: { lock: [3, 4], unlock: [1, 2] } }`
- **THEN** months 3 and 4 are locked (new rows inserted with `locked_by` set to the admin's user ID)
- **AND** months 1 and 2 are unlocked (`unlocked_at` set to current timestamp)
- **AND** the response contains the list of locked and unlocked months
- **AND** the response status is 200

#### Scenario: Non-admin user attempts to access month locks

- **GIVEN** a non-admin authenticated user
- **WHEN** any request is made to `/api/v1/month-locks` endpoints
- **THEN** the response status is 403 Forbidden

#### Scenario: Invalid year parameter

- **GIVEN** an authenticated admin user
- **WHEN** a GET request is made to `/api/v1/month-locks` without a `year` query parameter
- **THEN** the response status is 400 Bad Request
- **AND** the error message indicates the year parameter is required

### Requirement: Month Locks Service Layer

The server SHALL implement a `MonthLocksService` class following the repository pattern for business logic.

#### Scenario: Service retrieves locks for a year

- **GIVEN** the MonthLocksService is instantiated with a database connection
- **WHEN** `getLocksForYear(2026)` is called
- **THEN** it returns an array of MonthLock objects for that year
- **AND** only active locks (where `unlocked_at` is null) are included

#### Scenario: Service performs batch update

- **GIVEN** the MonthLocksService is instantiated with a database connection
- **WHEN** `batchUpdate(adminId, year, toLock, toUnlock)` is called
- **THEN** new lock records are created for months in `toLock` array
- **AND** existing lock records are soft-deleted (unlocked_at set) for months in `toUnlock` array
- **AND** the `locked_by` field is set to the provided `adminId`

### Requirement: MonthLockRepository Year Query

The `MonthLockRepository` SHALL support querying all active locks for a specific year.

#### Scenario: Finding all locks for a year

- **GIVEN** month locks exist for year 2026 months 1, 2, and 3
- **WHEN** `findByYear(2026)` is called on the repository
- **THEN** all three lock records are returned
- **AND** they are ordered by month ascending

## MODIFIED Requirements

### Requirement: Repository Structure

Each database entity SHALL have a corresponding repository class that extends the `BaseRepository` and implements a typed interface.

#### Scenario: MonthLockRepository with year query

- **GIVEN** the MonthLockRepository extends BaseRepository
- **WHEN** examining the repository interface
- **THEN** it includes `findByYear(year: number): Promise<MonthLock[]>` method
- **AND** it includes `findByYearAndMonth(year, month): Promise<MonthLock | null>` method
- **AND** it includes `isMonthLocked(year, month): Promise<boolean>` method
