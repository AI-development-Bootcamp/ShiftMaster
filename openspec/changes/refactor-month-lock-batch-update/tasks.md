# Tasks: Month Lock Batch Update

- [ ] **1. Refactor `useMonthLocks`**
    - [ ] Add `pendingLocks` state.
    - [ ] Update `toggleLock` to modify `pendingLocks`.
    - [ ] Implement `saveChanges` with batch logging.
    - [ ] Implement `discardChanges` / reset logic on mount.
    - [ ] Add `hasChanges` derived state.
- [ ] **2. Update `MonthLockModal`**
    - [ ] Add Footer with "Save" and "Cancel" buttons.
    - [ ] Connect buttons to `saveChanges` and `onClose`.
    - [ ] Ensure "X" click warns or discards (default: discard).
- [ ] **3. i18n**
    - [ ] Add translation keys for "Save", "Cancel", "No Changes".
- [ ] **4. Tests**
    - [ ] Update `useMonthLocks.test.ts` to reflect new batch behavior.
