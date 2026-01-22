# Proposal: Persist Month Lock Changes Across Year Navigation

## Summary

Enhance the month locks modal to remember user toggle choices across year navigation, and save all accumulated changes (across multiple years) in a single operation when the user clicks Save.

## Motivation

Currently, when an admin navigates between years in the month locks modal:
- Pending changes for the previous year are **lost**
- Each year is fetched fresh, overwriting any unsaved toggles
- Save only sends changes for the currently viewed year

This creates a poor UX where users must save after each year change, or lose their work.

## Current Behavior

1. Hook `useMonthLocks(year, userId)` is tied to a single year
2. When `year` changes, `useEffect` fetches new data and resets `pendingLocks`
3. `saveChanges()` only calculates and sends changes for the current year
4. Navigating away discards unsaved changes

## Proposed Behavior

1. **Accumulate changes across years**: Store pending locks for ALL years in a single state object
2. **Preserve changes on navigation**: When navigating to a new year, merge fetched locks with any existing pending changes for that year
3. **Save all changes at once**: Send batch requests for each year that has modifications
4. **Show pending indicator**: Visually indicate which months have unsaved changes (even when viewing other years)

## Scope

### In Scope
- Refactor `useMonthLocks` hook to manage multi-year state
- Update `saveChanges` to send requests for all modified years
- Update `hasChanges` to detect changes across all years
- Preserve pending state when year changes

### Out of Scope
- Backend API changes (existing batch endpoint works per-year, we'll call it multiple times)
- Persisting changes across modal close/reopen (changes are still lost on close)
- Visual indicator for "changes in other years" (simple implementation first)

## Technical Approach

### State Structure Change

**Current:**
```typescript
const [serverLocks, setServerLocks] = useState<MonthLock[]>([]);
const [pendingLocks, setPendingLocks] = useState<MonthLock[]>([]);
```

**Proposed:**
```typescript
// Map of year -> locks for that year
const [serverLocksByYear, setServerLocksByYear] = useState<Map<number, MonthLock[]>>(new Map());
const [pendingLocksByYear, setPendingLocksByYear] = useState<Map<number, MonthLock[]>>(new Map());
```

### Key Changes

1. **On year change**: Fetch locks for new year IF not already cached, preserve existing pending state
2. **On toggle**: Update `pendingLocksByYear` for the specific year
3. **On save**: Iterate over all years with changes, send batch request for each
4. **hasChanges**: Compare across all years in the maps

## Risks

- **Multiple API calls on save**: If user modifies many years, save will make multiple sequential requests. This is acceptable for the expected use case (typically 1-2 years modified).
- **Memory**: Storing locks for multiple years. Minimal concern - each year has max 12 lock objects.

## Success Criteria

1. Toggle a month in 2024, navigate to 2025, toggle a month, navigate back to 2024 - original toggle is preserved
2. Click Save - both 2024 and 2025 changes are sent to the server
3. `hasChanges` returns true when any year has unsaved changes
