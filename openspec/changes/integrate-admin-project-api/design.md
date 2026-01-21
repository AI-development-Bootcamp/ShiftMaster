# Design: Integrate Admin Project API

## Architecture

### 1. Service Layer (`projectsApi.ts`)
A new file `admin/src/api/projectsApi.ts` will wrap `apiClient` to provide typed functions matching the `projectsController`:
- `fetchProjects(params)`: GET /api/v1/projects
- `createProject(data)`: POST /api/v1/projects
- `updateProject(id, data)`: PATCH /api/v1/projects/:id
- `deleteProject(id)`: DELETE /api/v1/projects/:id

### 2. Frontend Integration

#### `AssignmentPage.tsx`
- Replace `mockProjects` with `projects` state fetched via `fetchProjects`.
- **Create**: Call `createProject`.
  - Maps form fields (`projectName` -> `name`, `clientId`, `projectDuration` -> `start_date`/`end_date`, `description`).
  - **Defaults**:
    - `manager_user_id`: `mockCurrentUser.user_id` (Temporary until Auth context).
    - `time_format_type`: `'start_end'` (Default, or safe fall back).
    - `active`: `true`.
- **Edit**: Call `updateProject`.
  - Maps form fields.
  - Partial updates supported.
- **Delete**: Call `deleteProject`.

#### `EntriesManagementPage.tsx`
- Replace `mockProjects` with `projects` state.
- **Radio Cell**:
  - `handleRadioChange` will call `updateProject(projectId, { time_format_type: newValue })`.
  - Optimistic UI update or refresh after success.

## Data Models
- Use `Project` interface from `@abra-shift-master/shared`.
- API Input types will be defined in `projectsApi.ts` matching server validation schemas.
