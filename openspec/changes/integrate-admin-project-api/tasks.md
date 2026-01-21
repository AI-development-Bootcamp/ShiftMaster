# Tasks: Integrate Admin Project API

## 1. API Service Layer

- [x] 1.1 Create `admin/src/api/projectsApi.ts`
  - `fetchProjects`
  - `createProject`
  - `updateProject`
  - `deleteProject`

## 2. Update EntriesManagementPage

- [x] 2.1 Replace `mockProjects` with `fetchProjects()` API call
- [x] 2.2 Wire up `handleRadioChange` to `updateProject` (PATCH) for `time_format_type`
- [x] 2.3 Handle loading/error states

## 3. Update AssignmentPage

- [x] 3.1 Replace `mockProjects` with `fetchProjects()` API call
- [x] 3.2 Implement `createProject` form submission
  - Include default `manager_user_id` and `time_format_type`
- [x] 3.3 Implement `updateProject` (edit) form submission
- [x] 3.4 Implement `deleteProject`
- [x] 3.5 Enhance `createTask` and `editTask` form options
  - Filter `active` projects
  - Sort projects A-Z

## 4. Verification

- [x] 4.1 Verify Project Create (Static implementation verification)
- [x] 4.2 Verify Project Edit (Static implementation verification)
- [x] 4.3 Verify Project Delete (Static implementation verification)
- [x] 4.4 Verify Radio Button update (EntriesManagementPage) (Implemented and Linted)
