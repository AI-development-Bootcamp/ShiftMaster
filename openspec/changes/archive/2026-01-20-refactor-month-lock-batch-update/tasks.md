# Tasks: Month Lock Batch Update

- [x] **1. Refactor `useMonthLocks`**
    - [x] Add `pendingLocks` state.
    - [x] Update `toggleLock` to modify `pendingLocks`.
    - [x] Implement `saveChanges` with batch logging.
    - [x] Implement `discardChanges` / reset logic on mount.
    - [x] Add `hasChanges` derived state.
- [x] **2. Update `MonthLockModal`**
    - [x] Add Footer with centered "Save" button.
    - [x] Connect "Save" to `saveChanges` and `onClose`.
    - [x] Ensure click outside / "X" discards changes without warning.
- [x] **3. i18n**
    - [x] Add translation keys for "Save".
- [x] **4. Tests**
    - [x] Update `useMonthLocks.test.ts` to reflect new batch behavior.
