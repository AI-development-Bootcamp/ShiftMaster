# Design: Month Lock Batch Update

## Architectural Change
We are moving from an optimistic, per-action persistence model to a transactional, batch-action model.

### State Flow
1.  `initialLocks` loaded from "Server".
2.  User interactions modify `pendingLocks` (local generic Set or Array operations).
3.  UI renders `pendingLocks`.
4.  On Save:
    -   `toLock = pending - initial`
    -   `toUnlock = initial - pending`
    -   Payload: `{ toLock, toUnlock }`
    -   "Server" accepts payload.
    -   `initialLocks` becomes `pendingLocks`.

### UX Considerations
-   **Discards**: Since the modal is transient, closing it without saving is an implicit discard. This is standard pattern for modals with "Save"/"Cancel" buttons.
-   **Feedback**: Loading state during "Save" is important if the API is slow.

### API Schema (Mock)
```typescript
interface BatchLockRequest {
  year: number;
  operations: {
    lock: number[];   // array of month numbers to lock
    unlock: number[]; // array of month numbers to unlock
  }
}
```

## Internationalization
New keys to be added to `monthLocks` in `he.json`:

```json
{
  "monthLocks": {
    "actions": {
        "save": "שמור שינויים",
        "cancel": "ביטול",
        "discard": "בטל שינויים"
    },
    "messages": {
        "unsavedChanges": "ישנם שינויים שלא נשמרו",
        "confirmDiscard": "האם אתה בטוח שברצונך לצאת? השינויים יאבדו."
    }
}
```
