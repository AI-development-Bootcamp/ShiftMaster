# Tasks: Persist Month Lock Changes Across Year Navigation

## 1. Refactor useMonthLocks Hook State Management

- [x] 1.1 Change state from single-year arrays to year-keyed Maps
  - `serverLocksByYear: Map<number, MonthLock[]>`
  - `pendingLocksByYear: Map<number, MonthLock[]>`
  - Track `loadedYears: Set<number>` to know which years are fetched

- [x] 1.2 Update data fetching logic
  - Only fetch if year not in `loadedYears`
  - Merge fetched data into existing Maps (don't replace)
  - Preserve any pending changes for the year being fetched

- [x] 1.3 Update `toggleLock` function
  - Update `pendingLocksByYear` for the specific year

- [x] 1.4 Update `hasChanges` computation
  - Compare `serverLocksByYear` vs `pendingLocksByYear` across ALL years
  - Return true if any year has differences

- [x] 1.5 Update `saveChanges` function
  - Calculate deltas for each year with changes
  - Send batch requests sequentially for each modified year
  - Update `serverLocksByYear` on success
  - Rollback all on any failure

- [x] 1.6 Update `discardChanges` function
  - Reset `pendingLocksByYear` to match `serverLocksByYear` for all years

- [x] 1.7 Update return value
  - `locks` returns pending locks for the CURRENT year (for display)

## 2. Update MonthLockModal Component

- [x] 2.1 Update save button handler for multi-year saves
  - Added `hasChanges` from hook to disable save button when no changes
  - Save handler already works with multi-year saves (hook handles internally)

## 3. Update Tests

- [x] 3.1 Update `useMonthLocks.test.ts`
  - Test: Changes preserved across year navigation
  - Test: Save sends requests for all modified years
  - Test: `hasChanges` detects changes across years
  - Test: Discard reverts all years
  - Test: Does not refetch already loaded years

## 4. Verification

- [x] 4.1 Run admin tests (`npm test -w admin`) - 14 tests passing
- [x] 4.2 Run linting (`npm run lint -w admin`) - No errors
- [ ] 4.3 Manual test: Toggle months in multiple years, verify all saved
