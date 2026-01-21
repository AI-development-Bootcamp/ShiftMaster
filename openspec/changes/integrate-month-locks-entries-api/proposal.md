# Change: Integrate Month Locks API and Convert Entries Management to Real Data

## Why

The `EntriesManagementPage` and MonthLocks UI currently rely on mock data. To provide a functional admin experience, these features need to be integrated with real backend APIs. The `MonthLockRepository` already exists but has no controller, service, or routes exposing it. Similarly, the EntriesManagementPage needs to fetch real Projects and Clients data (endpoints already exist) instead of using mocks.

## What Changes

### Backend (Server)

- **[NEW]** `MonthLocksService` - Business logic for month lock operations (list by year, batch update)
- **[NEW]** `monthLocksController.ts` - Controller handling HTTP requests for month locks
- **[NEW]** `monthLocks.ts` route - REST endpoints with admin-only access:
  - `GET /api/v1/month-locks?year=XXXX` - List active locks for a year
  - `PUT /api/v1/month-locks/batch` - Batch lock/unlock months
- **[MODIFY]** `routes/index.ts` - Register the new month-locks router

### Frontend (Admin)

- **[NEW]** `monthLocksService.ts` - Frontend service for month locks API calls
- **[MODIFY]** `useMonthLocks.ts` hook - Replace mock data with real API calls using the new service
- **[NEW]** `entriesService.ts` - Frontend service for fetching Projects and Clients (using existing `/projects` and `/clients` endpoints)
- **[MODIFY]** `EntriesManagementPage.tsx` - Replace mock data with real API data using the new service

## Impact

- **Affected specs**: `backend-server`, `frontend-admin`, `month-locks`
- **Affected code**:
  - Server: `routes/`, `controllers/`, `services/`, `db/repositories/MonthLockRepository.ts`
  - Admin: `hooks/useMonthLocks.ts`, `pages/EntriesManagementPage/`, `services/`

## API Design

### GET /api/v1/month-locks

**Query Parameters:**
- `year` (required): The year to fetch locks for (e.g., 2026)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "locks": [
      {
        "lock_id": "uuid",
        "year": 2026,
        "month": 1,
        "locked_at": "2026-02-05T09:00:00Z",
        "locked_by": "admin-user-id"
      }
    ]
  }
}
```

### PUT /api/v1/month-locks/batch

**Request Body:**
```json
{
  "year": 2026,
  "operations": {
    "lock": [3, 4],
    "unlock": [1, 2]
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "locked": [3, 4],
    "unlocked": [1, 2]
  }
}
```

## Security

- All month-locks endpoints require admin authentication (`isAuthenticated`, `isAdmin` middleware)
- `locked_by` field is automatically set to the authenticated admin's user ID
