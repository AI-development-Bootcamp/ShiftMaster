# Client Management Design

## Architecture
- **Controller Layer**: Handles HTTP requests, validation (Zod), and response formatting.
- **Service Layer**: Contains business logic (e.g., uniqueness checks) and orchestration.
- **Repository Layer**: (To be confirmed/added) Wrapper around Supabase client.
- **Data Access**: Direct Supabase calls via repository.

## Components
- `ClientsService`: Main business logic.
- `clientsController`: API handlers.
- `clientValidation`: Zod schemas.

## Data Model
- `clients` table (existing):
  - `client_id` (PK)
  - `name`
  - `contact_info`
  - `active`
  - `created_at`

## API Design
- `POST /clients`: Create
- `GET /clients`: List (with pagination and search)
- `GET /clients/:id`: Get details
- `PATCH /clients/:id`: Update
- `DELETE /clients/:id`: Soft delete
