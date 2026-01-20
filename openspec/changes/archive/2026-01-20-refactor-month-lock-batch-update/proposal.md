# Month Lock Batch Update Proposal

## Goal
Change the Month Lock feature from an "instant save" model (where clicking a month immediately locks/unlocks it on the server) to a "batch update" model. Users will toggle months locally and click a "Save" button to commit all changes at once.

## User Review Required
> [!IMPORTANT]
> This changes the UX significantly. Users will now have to explicitly click "Save" to apply changes. Closing the modal without saving will discard changes.

## Proposed Changes

### 1. `useMonthLocks` Hook Refactor
-   **State Management**:
    -   Maintain `serverLocks`: The state as fetched from the API (or Mock).
    -   Maintain `pendingLocks`: The local state reflecting user toggles.
    -   `toggleLock`: Now only updates `pendingLocks`.
    -   `hasChanges`: Boolean indicating if `pendingLocks` differs from `serverLocks`.
-   **New Methods**:
    -   `saveChanges()`:
        -   Calculates the delta (months to lock, months to unlock).
        -   Sends a batch request (simulated with `console.log` for now).
        -   On success, updates `serverLocks` to match `pendingLocks`.
    -   `discardChanges()`: Resets `pendingLocks` to `serverLocks`.

### 2. `MonthLockModal` Component
-   **Footer**: Add a footer section to the modal.
-   **Save Button**:
    -   Label: "שמור" (Save).
    -   Design: Standard button styles (identical to others), Centered in the footer.
    -   Action: Calls `saveChanges()` and closes the modal.
-   **Close Behavior**:
    -   Clicking outside the modal or the 'X' button immediately closes the modal without saving (changes are discarded). No confirmation dialog.

### 3. API interaction (Mock)
-   The current `console.log` in `toggleLock` will be moved to `saveChanges`.
-   It will log a single object containing the batch operations.

## Verification Plan

### Automated Tests
-   `useMonthLocks.test.ts`:
    -   Verify `toggleLock` updates `pendingLocks` but not `serverLocks` (conceptually).
    -   Verify `hasChanges` is true after toggle.
    -   Verify `saveChanges` triggers the expected log/API call.
    -   Verify `discardChanges` reverts state.

### Manual Verification
1.  Open Month Lock modal.
2.  Toggle a few months (visuals should update).
3.  Check console: **Should NOT** see API logs yet.
4.  Click "Save".
5.  Check console: **Should** see a single log with changes.
6.  Re-open modal: Changes should be persisted (in mock state).
