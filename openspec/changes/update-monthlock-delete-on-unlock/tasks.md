# Tasks: Update Month Lock Delete-on-Unlock Schema

## 1. Shared Types Update

- [x] 1.1 Update `MonthLock` interface in `shared/src/types/models.ts`
  - Remove optional `unlocked_at?: string` field

## 2. Backend Repository Updates

- [x] 2.1 Update `MonthLockRepository.findByYearAndMonth()` in `server/src/db/repositories/MonthLockRepository.ts`
  - Remove `.is('unlocked_at', null)` filter (no longer needed - rows don't have this field)

- [x] 2.2 Update `MonthLockRepository.findByYear()` in `server/src/db/repositories/MonthLockRepository.ts`
  - Remove `.is('unlocked_at', null)` filter

- [x] 2.3 Add `delete(lockId: string)` method to `MonthLockRepository` for row deletion
  - Already available via `BaseRepository.delete()` which does hard delete for `month_locks` table

## 3. Backend Service Updates

- [ ] 3.1 Update `MonthLocksService.batchUpdate()` in `server/src/services/monthLocksService.ts`
  - Change unlock logic from `this.monthLockRepo.update(existingLock.lock_id, { unlocked_at: ... })`
  - To `this.monthLockRepo.delete(existingLock.lock_id)`

## 4. Backend Test Updates

- [ ] 4.1 Update `monthLocksService.test.ts`
  - Change expectation from `update()` to `delete()` for unlock operations
  - Remove any assertions about `unlocked_at` field

- [ ] 4.2 Update `monthLocksController.test.ts` if affected
  - Verify mock setup reflects delete-based unlocking

## 5. Verification

- [ ] 5.1 Run server tests (`npm test -w server`)
- [ ] 5.2 Run shared tests (`npm test -w shared`)
- [ ] 5.3 Run admin tests (`npm test -w admin`)
- [ ] 5.4 Run linting for all workspaces (`npm run lint`)
- [ ] 5.5 Manual test: Open MonthLocks modal, lock a month, save, verify row created
- [ ] 5.6 Manual test: Unlock the month, save, verify row deleted (not updated)
