# Implement Server CRUD Endpoints

## Problem
The server lacks API endpoints for core entities defined in the project requirements (`Projects`, `Tasks`, `Entries`, `AdminTaskAssignments`, `MonthLocks`). Currently, only `Users` and `Clients` (partially) are implemented. This prevents the frontend from interacting with the system for its primary functions (time tracking, project management).

## Solution
Implement full CRUD REST API endpoints for the missing entities, following the layered architecture pattern (Routes -> Controllers -> Services -> Repositories) used for `Users`.
Update Swagger documentation for all new endpoints.

## Scope
- **Entities**: `Projects`.
- **Layers**:
    - **Routes**: Express routers with validation and auth middleware.
    - **Controllers**: Request handling, parameter extraction, response formatting.
    - **Services**: Business logic, repository interaction.
    - **Swagger**: OpenAPI documentation in `utils/swagger.ts` and route annotations.
- **Testing**: Unit tests for Services and Controllers; Integration tests for Routes.

## Risks
- **Dependencies**: Projects rely on Clients and Users (Managers). We assume these exist or can be mocked.
