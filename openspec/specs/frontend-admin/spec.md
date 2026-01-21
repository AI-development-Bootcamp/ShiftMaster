# frontend-admin Specification

## Purpose
TBD - created by archiving change setup-initial-monorepo. Update Purpose after archive.
## Requirements
### Requirement: Web-Based Admin Application

The admin application SHALL be a web-based application built with React, Vite, and TypeScript.

#### Scenario: Application initialization

- **WHEN** the admin app is started
- **THEN** it runs on port 5174 and renders without errors

#### Scenario: Web-optimized interface

- **WHEN** viewing the admin application
- **THEN** the interface is optimized for desktop/web browsers

### Requirement: React and Vite Setup

The admin SHALL use Vite as the build tool with React and TypeScript.

#### Scenario: Development server

- **WHEN** running npm run dev in /admin
- **THEN** Vite starts the development server with hot module replacement

#### Scenario: Production build

- **WHEN** running npm run build in /admin
- **THEN** Vite creates an optimized production bundle

### Requirement: Redux State Management

The admin SHALL use Redux Toolkit for state management with a store independent from the client application.

#### Scenario: Store initialization

- **WHEN** the admin app starts
- **THEN** the Redux store is created and available to all components

#### Scenario: Store independence

- **WHEN** examining the admin Redux store
- **THEN** it has no shared state with the client application

### Requirement: Directory Structure

The admin SHALL organize code into components, pages, store, styles, and utils directories.

#### Scenario: Standard structure

- **WHEN** viewing /admin/src
- **THEN** components/, pages/, store/, styles/, and utils/ directories exist

### Requirement: Routing Setup

The admin SHALL use React Router for navigation.

#### Scenario: Router configuration

- **WHEN** the app initializes
- **THEN** React Router is configured and ready for route definitions

### Requirement: Styling with Plain CSS

The admin SHALL use plain CSS files for styling.

#### Scenario: CSS reset

- **WHEN** the app loads
- **THEN** a CSS reset is applied for consistent cross-browser styling

### Requirement: Testing Configuration

The admin SHALL use Vitest for unit and integration testing.

#### Scenario: Test execution

- **WHEN** running npm test in /admin
- **THEN** Vitest executes all test files

#### Scenario: Test file convention

- **WHEN** creating new tests
- **THEN** they follow the _.test.ts or _.test.tsx naming pattern

### Requirement: Environment Variables

The admin SHALL load the VITE_API_URL environment variable for backend API communication.

#### Scenario: API URL configuration

- **WHEN** the admin makes API requests
- **THEN** it uses the URL from VITE_API_URL environment variable

### Requirement: UI Independence

The admin application SHALL have a completely separate UI implementation from the client application.

#### Scenario: Separate components

- **WHEN** examining admin components
- **THEN** they are not shared with the client application

### Requirement: Right Sidebar Navigation

The admin application SHALL provide a fixed right sidebar (`RightSidebarTaskbar`) for navigation between management screens.

#### Scenario: Sidebar visibility

- **WHEN** a user is on any authenticated admin page
- **THEN** the sidebar is visible on the right side of the screen with full viewport height

#### Scenario: Sidebar width

- **WHEN** viewing the sidebar on desktop
- **THEN** it occupies 1/6 of the screen width

### Requirement: Sidebar Header Section

The sidebar header SHALL display the company logo and optionally the system name.

#### Scenario: Logo display

- **WHEN** viewing the sidebar header
- **THEN** the Abra company logo is displayed and centered horizontally

### Requirement: Sidebar Navigation Section

The sidebar navigation SHALL display a list of available management screens with icons and labels.

#### Scenario: Navigation items display

- **WHEN** viewing the sidebar navigation
- **THEN** all configured screen items are displayed in a vertical list with RTL text alignment

#### Scenario: Active screen indication

- **WHEN** the user is on a specific screen
- **THEN** the corresponding navigation item shows an active state with highlighted text and an orange indicator bar on the left side

#### Scenario: Navigation hover state

- **WHEN** hovering over a non-active navigation item
- **THEN** the item background changes to a lighter shade

#### Scenario: Navigation click

- **WHEN** clicking a navigation item
- **THEN** the application navigates to the corresponding screen route

### Requirement: Sidebar Footer Section

The sidebar footer SHALL display the current user's profile information.

#### Scenario: User info display

- **WHEN** viewing the sidebar footer
- **THEN** the user's name, role/title, and avatar are displayed

#### Scenario: Avatar placeholder

- **WHEN** no custom avatar is set
- **THEN** the company logo is displayed in a circular frame as a placeholder

### Requirement: Sidebar Accessibility

The sidebar navigation SHALL be fully accessible via keyboard and screen readers.

#### Scenario: Keyboard navigation

- **WHEN** using keyboard to navigate the sidebar
- **THEN** all navigation items are focusable and in logical tab order

#### Scenario: Screen reader support

- **WHEN** a screen reader reads the active navigation item
- **THEN** it announces the current page using `aria-current="page"`

### Requirement: Month Lock Management UI

The admin application SHALL provide a Month Lock management interface accessible only to admin users from the Entries Management Page.

#### Scenario: Admin-only button visibility

- **WHEN** an admin user views the Entries Management Page
- **THEN** a "Month Locks" button is displayed in the page header

#### Scenario: Non-admin button hidden

- **WHEN** a non-admin user views the Entries Management Page
- **THEN** the "Month Locks" button is not rendered (not just disabled)

#### Scenario: Modal open on button click

- **WHEN** an admin clicks the "Month Locks" button
- **THEN** a modal overlay opens displaying the month lock management interface

### Requirement: Month Lock Modal

The Month Lock modal SHALL display a year navigator and a 12-month grid for lock management.

#### Scenario: Modal structure

- **WHEN** the modal is open
- **THEN** it displays a year navigation header, a 12-month tile grid, and close controls (X button, overlay click, ESC key)

#### Scenario: RTL layout and Hebrew text

- **WHEN** viewing the modal
- **THEN** all text is in Hebrew, layout is RTL, and month names are displayed in full (ינואר, פברואר, ..., דצמבר)

#### Scenario: Close via X button

- **WHEN** the admin clicks the X button in the modal
- **THEN** the modal closes

#### Scenario: Close via overlay click

- **WHEN** the admin clicks outside the modal content area
- **THEN** the modal closes

#### Scenario: Close via ESC key

- **WHEN** the admin presses the ESC key while the modal is open
- **THEN** the modal closes

#### Scenario: Focus trap

- **WHEN** the modal is open
- **THEN** keyboard focus is trapped within the modal and does not escape to background content

### Requirement: Year Navigation

The modal SHALL allow navigation between years with no past limit and optional future navigation.

#### Scenario: Current year display

- **WHEN** the modal opens
- **THEN** the current year is displayed in the year navigator

#### Scenario: Previous year navigation

- **WHEN** the admin clicks the "previous year" button
- **THEN** the year decrements by 1 and the month grid updates for that year

#### Scenario: Next year navigation

- **WHEN** the admin clicks the "next year" button
- **THEN** the year increments by 1 and the month grid updates for that year

#### Scenario: Infinite past navigation

- **WHEN** the admin navigates to past years
- **THEN** there is no lower limit on year selection

### Requirement: Month Lock Toggle

Each month tile SHALL display the current lock state and allow toggling between locked and unlocked.

#### Scenario: Locked month display

- **WHEN** a month is locked (exists in mockMonthLocks data)
- **THEN** the tile displays with a red background

#### Scenario: Unlocked month display

- **WHEN** a month is unlocked (does not exist in mockMonthLocks data)
- **THEN** the tile displays with a gray background

#### Scenario: Toggle to locked

- **WHEN** an admin clicks an unlocked month tile
- **THEN** the tile immediately changes to red (locked) and a "prepare create" payload is logged to console with `{ year, month, lockedByUserId }`

#### Scenario: Toggle to unlocked

- **WHEN** an admin clicks a locked month tile
- **THEN** the tile immediately changes to gray (unlocked) and a "prepare delete" payload is logged to console with `{ lockId }` or `{ year, month }`

#### Scenario: Optimistic UI update

- **WHEN** a month is toggled
- **THEN** the UI updates immediately without waiting for server confirmation

### Requirement: Loading States

The modal SHALL display skeleton loading states during data fetches.

#### Scenario: Year transition loading

- **WHEN** the admin changes the year
- **THEN** a skeleton grid (12 tiles) is displayed while loading lock data for the new year

#### Scenario: Initial load skeleton

- **WHEN** the modal first opens
- **THEN** a skeleton grid is displayed while loading lock data for the current year

### Requirement: Mock Data Integration

The Month Lock UI SHALL consume data from `admin/src/mocks/monthLocks.ts` via an API-ready abstraction layer.

#### Scenario: Mock data consumption

- **WHEN** the modal loads lock data
- **THEN** it uses a `useMonthLocks(year)` hook that reads from mockMonthLocks.ts

#### Scenario: No direct mock imports in components

- **WHEN** examining component code
- **THEN** components do not import mockMonthLocks.ts directly; they use the hook abstraction

#### Scenario: API-ready hook structure

- **WHEN** reviewing the useMonthLocks hook
- **THEN** it returns `{ locks, isLoading, toggleLock }` with a structure compatible for future API integration

### Requirement: Internationalization

All Month Lock UI text SHALL be translated using the i18n system with Hebrew translations.

#### Scenario: Month names in Hebrew

- **WHEN** viewing month tiles
- **THEN** month names are displayed in Hebrew using i18n keys (e.g., `t('monthNames.january')` → "ינואר")

#### Scenario: UI labels in Hebrew

- **WHEN** viewing the modal and button
- **THEN** all UI text (button label, modal title, etc.) uses Hebrew translations from `admin/src/locales/he/translation.json`

