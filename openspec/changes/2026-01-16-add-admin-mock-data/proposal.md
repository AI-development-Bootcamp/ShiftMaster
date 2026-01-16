# Add Admin Mock Data

## Goal
Implement a mock data layer in the Admin application to simulate backend responses. This enables frontend development and testing of pages (Assignment, Entries Management) without requiring a running backend or database.

## Motivation
The Admin frontend needs to be developed and verified independently of the backend. By defining mock data structures that strictly adhere to the shared types (`shared/src/types/models.ts`) and the project's API response format (`project.md`), we can ensure smooth future integration while unblocking current UI work.

## Scope
- Create a `admin/src/mocks` directory.
- Implement mock data factories/constants for `Users`, `Clients`, `Projects`, `Tasks`, `Entries`, `AdminTaskAssignments`, and `MonthLocks`.
- Ensure all mocks use types from `@abra-shift-master/shared`.
- Implement a helper to wrap data in the standard API response format (`{ success: true, data: ... }`).

## Out of Scope
- Backend implementation.
- Real API integration.
- Mocking state mutations (this is static or simple in-memory mock data for display/testing).
