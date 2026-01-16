# Add Admin Mock Data

## Goal
Implement a mock data layer in the Admin application to simulate backend responses. This enables frontend development and testing of pages (Assignment, Entries Management) without requiring a running backend or database.

## Why
To enable frontend development and testing of the Admin panel without dependencies on the backend implementation, we need a robust set of mock data that mirrors the shared types and expected API structure.

## Motivation
The Admin frontend needs to be developed and verified independently of the backend. By defining mock data structures that strictly adhere to the shared types (`shared/src/types/models.ts`) and the project's API response format (`project.md`), we can ensure smooth future integration while unblocking current UI work.

## What Changes
*   **[NEW]** `admin/src/mocks/data.ts`: Contains mock data for Users, Clients, Projects, Tasks, Entries, AdminTaskAssignments, and MonthLocks.
*   **[NEW]** `admin/src/mocks/utils.ts`: Helper functions for generating standardized API responses (`ApiResponse<T>`).
*   **[NEW]** `admin/src/types/index.ts`: Export shared types for easier consumption in admin components.

## Impact
*   **Admin Panel**: Will be able to render realistic data in `EmployeesManagmentPage`, `RightSidebarTaskbar`, and other components.
*   **API Response Format**: Establishes a standard structure (`success`, `data`, `error`) for frontend data consumption, aligned with the backend's expected output.
*   **Shared Types**: Utilizes the `@abra-shift-master/shared` package to ensure type consistency between frontend and (future) backend.

## Scope
- Create a `admin/src/mocks` directory.
- Implement mock data factories/constants for `Users`, `Clients`, `Projects`, `Tasks`, `Entries`, `AdminTaskAssignments`, and `MonthLocks`.
- Ensure all mocks use types from `@abra-shift-master/shared`.
- Implement a helper to wrap data in the standard API response format (`{ success: true, data: ... }`).

## Out of Scope
- Backend implementation.
- Real API integration.
- Mocking state mutations (this is static or simple in-memory mock data for display/testing).
