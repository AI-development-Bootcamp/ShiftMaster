# Design: Month Locks API Integration

## Context

The `MonthLockRepository` already exists with methods `findByYearAndMonth(year, month)` and `isMonthLocked(year, month)`. The frontend `useMonthLocks` hook already implements batch update logic with optimistic updates, but currently calls a non-existent `api.batchUpdateMonthLocks()` method.

The backend needs a service layer and REST endpoints to expose this functionality. The frontend needs to replace mock data with real API calls.

## Goals

- Expose month locks data via REST API with admin-only access
- Support batch lock/unlock operations for efficiency
- Convert EntriesManagementPage from mock data to real API data
- Maintain existing UI behavior (optimistic updates, batch saves)

## Non-Goals

- Changing the database schema (already exists)
- Modifying the MonthLock UI components (already functional)
- Adding new UI features to EntriesManagementPage

## Decisions

### 1. MonthLockRepository Extension

**Decision**: Add a `findByYear(year: number)` method to `MonthLockRepository` for efficient querying.

**Rationale**: The current `findByYearAndMonth` method only retrieves one lock at a time. For the list endpoint, we need all active locks for a year in a single query.

```typescript
async findByYear(year: number): Promise<MonthLock[]> {
  const { data, error } = await this.dbConnection
    .from(this.table)
    .select('*')
    .eq('year', year)
    .is('unlocked_at', null)
    .order('month', { ascending: true });
  // ...
}
```

### 2. Batch Update Strategy

**Decision**: Use a single transaction-like approach where locks are created (INSERT) and unlocks are updates (SET unlocked_at = now()).

**Rationale**: 
- Locking: Insert a new row with `locked_by` set to the admin user ID
- Unlocking: Update existing row to set `unlocked_at` timestamp (soft delete approach)
- This matches the existing DB schema where `unlocked_at IS NULL` means locked

```typescript
async batchUpdate(actorId: string, year: number, toLock: number[], toUnlock: number[]) {
  // For each month to lock: INSERT if not already locked
  // For each month to unlock: UPDATE SET unlocked_at = NOW() where year/month match
}
```

### 3. Service Pattern Consistency

**Decision**: Follow the existing service pattern (like `UsersService`) with dependency injection of `SupabaseClient`.

**Rationale**: Maintains consistency with existing codebase. Allows for testing with mock clients.

### 4. Frontend Service Layer

**Decision**: Create dedicated service files (`monthLocksService.ts`, `entriesService.ts`) following the pattern in `assignmentService.ts`.

**Rationale**: Centralizes API calls, makes testing easier, keeps hooks focused on state management.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Race conditions during batch update | Validation in service layer; existing unique constraint on (year, month) prevents duplicate locks |
| API response format mismatch | Align with existing conventions (success envelope, data wrapper) |
| Optimistic update rollback | Frontend hook already handles rollback on error; ensure API errors are properly propagated |

## Open Questions

*None - all clarifications addressed in requirements gathering.*
