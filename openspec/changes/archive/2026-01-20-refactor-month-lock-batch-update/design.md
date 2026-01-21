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
-   **Footer**: Single "Save" button, centered.
-   **Discards**: Closing the modal (click outside / X) immediately discards changes without confirmation.

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
        "save": "שמור שינויים"
    }
}
```
