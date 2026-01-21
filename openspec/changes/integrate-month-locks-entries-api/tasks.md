# Tasks: Integrate Month Locks API and Entries Management

## 1. Backend - Month Locks Service

- [x] 1.1 Create `MonthLocksService` (`server/src/services/monthLocksService.ts`)
  - Method: `getLocksForYear(year: number): Promise<MonthLock[]>` - Returns active locks (unlocked_at is null)
  - Method: `batchUpdate(actorId: string, year: number, toLock: number[], toUnlock: number[])` - Batch lock/unlock

- [x] 1.2 Add `findByYear(year: number)` method to `MonthLockRepository` for efficient year queries

## 2. Backend - Month Locks Controller

- [x] 2.1 Create `monthLocksController.ts` (`server/src/controllers/monthLocksController.ts`)
  - Handler: `listLocks(req, res)` - GET /month-locks?year=XXXX
  - Handler: `batchUpdateLocks(req, res)` - PUT /month-locks/batch

- [x] 2.2 Add Zod validation schemas for request validation (year query param, batch update body)

## 3. Backend - Month Locks Routes

- [ ] 3.1 Create `monthLocks.ts` route file (`server/src/routes/monthLocks.ts`)
  - GET / - List locks for year (admin-only)
  - PUT /batch - Batch update locks (admin-only)

- [ ] 3.2 Register monthLocks router in `routes/index.ts`

## 4. Backend - Tests

- [ ] 4.1 Add unit tests for `MonthLocksService` (`server/src/tests/monthLocksService.test.ts`)
- [ ] 4.2 Add controller tests for `monthLocksController` (`server/src/tests/monthLocksController.test.ts`)

## 5. Frontend - Month Locks Service

- [ ] 5.1 Create `monthLocksService.ts` (`admin/src/services/monthLocksService.ts`)
  - `fetchLocksForYear(year: number): Promise<MonthLock[]>`
  - `batchUpdateLocks(payload: BatchUpdatePayload): Promise<BatchUpdateResult>`

## 6. Frontend - Update useMonthLocks Hook

- [ ] 6.1 Replace mock data fetch with `monthLocksService.fetchLocksForYear(year)`
- [ ] 6.2 Replace console.log API call with `monthLocksService.batchUpdateLocks(payload)`
- [ ] 6.3 Get actual admin user ID from Redux auth state instead of mock ID
- [ ] 6.4 Update tests in `useMonthLocks.test.ts` to mock the new service

## 7. Frontend - Entries Service

- [ ] 7.1 Create `entriesService.ts` (`admin/src/services/entriesService.ts`)
  - `fetchProjects(): Promise<Project[]>` - Uses existing `/projects` endpoint
  - `fetchClients(): Promise<Client[]>` - Uses existing `/clients` endpoint
  - `updateProjectTimeFormat(projectId: string, timeFormatType: ProjectTimeFormatType): Promise<Project>` - Uses PATCH `/projects/:id`

## 8. Frontend - Update EntriesManagementPage

- [ ] 8.1 Replace `mockProjects` with real data fetch using `entriesService.fetchProjects()`
- [ ] 8.2 Replace `mockClients` with real data fetch using `entriesService.fetchClients()`
- [ ] 8.3 Add loading and error states for data fetching
- [ ] 8.4 Connect `handleRadioChange` to `entriesService.updateProjectTimeFormat()`
- [ ] 8.5 Remove mock imports from EntriesManagementPage (keep `mockCurrentUser` for MonthLockButton until auth integration)

## 9. Backend - Project Update Endpoint (if not exists)

- [ ] 9.1 Verify or add PATCH `/projects/:id` endpoint for updating project `time_format_type`
- [ ] 9.2 Add `updateProject` method to `ProjectsService` if not exists

## 10. Verification

- [ ] 10.1 Run server tests (`npm test -w server`)
- [ ] 10.2 Run admin tests (`npm test -w admin`)
- [ ] 10.3 Run linting for both workspaces
- [ ] 10.4 Manual test: Open EntriesManagementPage, verify projects/clients load from DB
- [ ] 10.5 Manual test: Open MonthLocks modal, toggle locks, save, verify persistence
