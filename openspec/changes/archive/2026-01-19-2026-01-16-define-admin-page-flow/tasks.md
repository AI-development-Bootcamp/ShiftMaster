# Tasks

## Phase 1: LoginPage

1. [x] Create `LoginPage` folder at `admin/src/pages/LoginPage/`
2. [x] Create `LoginPage.tsx` component file
3. [x] Create `LoginPage.css` stylesheet
4. [x] Add fullscreen background using `login_background.svg`
5. [x] Create `LoginWelcomeCard` component folder at `admin/src/components/LoginWelcomeCard/`
6. [x] Create `LoginWelcomeCard.tsx` with email and password fields
7. [x] Create `LoginWelcomeCard.css` stylesheet
8. [x] Add login button that navigates to `/assignment` when fields are filled

## Phase 2: AssignmentPage

1. [x] Create `AssignmentPage` folder at `admin/src/pages/AssignmentPage/`
2. [x] Create `AssignmentPage.tsx` component file
3. [x] Create `AssignmentPage.css` stylesheet
4. [x] Integrate with shared sidebar layout
5. [x] Display placeholder content

## Phase 3: EntriesManagementPage

1. [x] Create `EntriesManagementPage` folder at `admin/src/pages/EntriesManagementPage/`
2. [x] Create `EntriesManagementPage.tsx` component file
3. [x] Create `EntriesManagementPage.css` stylesheet
4. [x] Integrate with shared sidebar layout
5. [x] Display placeholder content

## Phase 4: Routing & Navigation

1. [x] Update `App.tsx` to define route `/` → `LoginPage` (no sidebar)
2. [x] Update `App.tsx` to define route `/assignment` → `AssignmentPage` (with sidebar)
3. [x] Update `App.tsx` to define route `/entries` → `EntriesManagementPage` (with sidebar)
4. [x] Update `navigation.tsx` to reflect new pages (AssignmentPage, EntriesManagementPage)
5. [x] Remove existing placeholder routes from `App.tsx`

## Verification

1. [x] Manual: Start dev server and navigate to `/`
2. [x] Manual: Fill login fields and verify navigation to `/assignment`
3. [x] Manual: Verify sidebar is visible on AssignmentPage
4. [x] Manual: Navigate to `/entries` via sidebar
5. [x] Manual: Verify sidebar persists between pages
