# Proposal: Update Month Lock Frontend for Delete-on-Unlock Schema

## Summary

Update the frontend month locks handling to work with the new database schema where unlocking a month **deletes** the corresponding row instead of setting an `unlocked_at` timestamp.

## Motivation

The database schema for `month_locks` has been simplified:

**Previous Schema:**
| Field       | Type        | Constraints                        |
|-------------|-------------|------------------------------------|
| lock_id     | BIGINT      | Primary Key                        |
| year        | INT         | Required                           |
| month       | INT         | Required (1-12)                    |
| locked_at   | TIMESTAMPTZ |                                    |
| locked_by   | BIGINT      | Foreign Key → users, Must be admin |
| unlocked_at | TIMESTAMPTZ | Optional                           |

A month was considered "locked" when `unlocked_at` was NULL.

**New Schema:**
| Field       | Type        | Constraints                        |
|-------------|-------------|------------------------------------|
| lock_id     | BIGINT      | Primary Key                        |
| year        | INT         | Required                           |
| month       | INT         | Required (1-12)                    |
| locked_at   | TIMESTAMPTZ |                                    |
| locked_by   | BIGINT      | Foreign Key → users, Must be admin |

The `unlocked_at` field is **removed**. A month is locked if a row exists; unlocking **deletes** the row.

## Scope

### In Scope
- Update shared `MonthLock` type to remove `unlocked_at` field
- Update backend repository to delete rows instead of updating `unlocked_at`
- Frontend changes are minimal since UI already treats presence/absence as locked/unlocked

### Out of Scope
- No changes to the frontend UI logic (already works with presence-based locking)
- No changes to the batch update API contract (still accepts `lock: number[]` and `unlock: number[]`)

## Impact Analysis

### Files Affected

**Shared Types:**
- `shared/src/types/models.ts` - Remove `unlocked_at` from `MonthLock` interface

**Backend:**
- `server/src/db/repositories/MonthLockRepository.ts` - Change `findByYear` and `findByYearAndMonth` to not filter by `unlocked_at` (rows no longer have it)
- `server/src/services/monthLocksService.ts` - Change unlock operation from `update(unlocked_at)` to `delete(lock_id)`

**Frontend (minimal changes):**
- No changes required - the frontend already treats lock presence/absence correctly

**Tests:**
- `server/src/tests/services/monthLocksService.test.ts` - Update to expect delete instead of update
- `server/src/tests/controllers/monthLocksController.test.ts` - May need minor adjustments

### API Contract

The API contract remains unchanged:
- `GET /month-locks?year=XXXX` - Returns array of locked months
- `PUT /month-locks/batch` - Accepts `{ year, operations: { lock: number[], unlock: number[] } }`

The frontend service layer requires no changes.

## Risks

- **Low risk**: The change is straightforward and the API contract remains stable
- **Data migration**: Any existing rows with `unlocked_at` set will need to be deleted (they represent unlocked months that should no longer exist as rows)

## Success Criteria

1. Locking a month creates a new row in `month_locks`
2. Unlocking a month deletes the row from `month_locks`
3. All existing tests pass with updated expectations
4. Frontend month lock modal continues to work correctly
