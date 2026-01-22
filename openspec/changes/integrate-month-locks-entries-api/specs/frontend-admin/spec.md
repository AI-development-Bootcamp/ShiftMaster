## MODIFIED Requirements

### Requirement: Month Lock Data Source

The Month Lock components SHALL use a hook abstraction to retrieve lock data from the backend API.

#### Scenario: Hook fetches real data from API

- **GIVEN** the MonthLockModal is opened
- **WHEN** the `useMonthLocks(year)` hook initializes
- **THEN** it fetches lock data from `GET /api/v1/month-locks?year=XXXX`
- **AND** the locks state is populated with the API response
- **AND** components do not import mock data directly; they use the hook abstraction

#### Scenario: Hook saves changes via API

- **GIVEN** the user has made changes to month locks
- **WHEN** the user clicks "Save" and `saveChanges()` is called
- **THEN** a batch API request is sent to `PUT /api/v1/month-locks/batch`
- **AND** the payload includes the year and operations (lock/unlock arrays)
- **AND** the modal closes upon success

#### Scenario: Hook uses authenticated admin ID

- **GIVEN** an admin user is logged in
- **WHEN** reviewing the `useMonthLocks` hook implementation
- **THEN** the `locked_by` field uses the actual admin's user ID from the auth state
- **AND** no hardcoded mock user IDs are used

### Requirement: Entries Management Real Data

The Entries Management Page SHALL fetch Projects and Clients from the backend API instead of using mock data.

#### Scenario: Page loads projects from API

- **GIVEN** the EntriesManagementPage is rendered
- **WHEN** the component mounts
- **THEN** it fetches projects from `GET /api/v1/projects`
- **AND** the table displays the fetched project data
- **AND** mock project imports are removed

#### Scenario: Page loads clients from API

- **GIVEN** the EntriesManagementPage is rendered
- **WHEN** the component mounts
- **THEN** it fetches clients from `GET /api/v1/clients`
- **AND** client names are resolved from the fetched client data
- **AND** mock client imports are removed

#### Scenario: Page shows loading state

- **GIVEN** the EntriesManagementPage is rendering
- **WHEN** data is being fetched from the API
- **THEN** a loading indicator is displayed
- **AND** the table is not rendered until data is available

#### Scenario: Page handles fetch errors

- **GIVEN** the EntriesManagementPage is rendered
- **WHEN** the API request fails
- **THEN** an error message is displayed to the user
- **AND** the user can retry the fetch

#### Scenario: Radio change updates via API

- **GIVEN** the projects table is displayed
- **WHEN** the user changes a project's time_format_type via radio button
- **THEN** a PATCH request is sent to `PATCH /api/v1/projects/:id`
- **AND** the local state is updated optimistically
- **AND** the state is rolled back if the API call fails

## ADDED Requirements

### Requirement: Month Locks Frontend Service

The admin app SHALL have a dedicated service for month locks API interactions.

#### Scenario: Service fetches locks for a year

- **GIVEN** a monthLocksService is available
- **WHEN** `fetchLocksForYear(2026)` is called
- **THEN** it makes a GET request to `/month-locks?year=2026`
- **AND** returns the array of MonthLock objects from the response

#### Scenario: Service performs batch update

- **GIVEN** a monthLocksService is available
- **WHEN** `batchUpdateLocks({ year, operations })` is called
- **THEN** it makes a PUT request to `/month-locks/batch` with the payload
- **AND** returns the result containing locked and unlocked month arrays

### Requirement: Entries Frontend Service

The admin app SHALL have a dedicated service for entries-related API interactions (projects, clients).

#### Scenario: Service fetches projects

- **GIVEN** an entriesService is available
- **WHEN** `fetchProjects()` is called
- **THEN** it makes a GET request to `/projects`
- **AND** returns the array of Project objects

#### Scenario: Service fetches clients

- **GIVEN** an entriesService is available
- **WHEN** `fetchClients()` is called
- **THEN** it makes a GET request to `/clients`
- **AND** returns the array of Client objects

#### Scenario: Service updates project time format

- **GIVEN** an entriesService is available
- **WHEN** `updateProjectTimeFormat(projectId, 'sum')` is called
- **THEN** it makes a PATCH request to `/projects/:id` with the new time_format_type
- **AND** returns the updated Project object
