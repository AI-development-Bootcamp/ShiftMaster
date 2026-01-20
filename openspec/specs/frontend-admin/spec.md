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

### Requirement: Mock Data Integration

The Admin application SHALL include a mock data layer to allow frontend development and testing without a backend connection.

#### Scenario: Developing UI without Backend
- **Given** the backend is not running or implemented
- **When** a developer works on the Admin UI
- **Then** they can import typed mock data from `admin/src/mocks` that matches the shared data models and API response structure.

#### Scenario: API Response Simulation
- **Given** a need to test error handling or success states
- **When** using mock data utilities
- **Then** the data is wrapped in the standard `ApiResponse<T>` format defined in the project documentation.

### Requirement: FormShell Modal Component

The admin application SHALL provide a `FormShell` component that renders forms as centered modal dialogs with a consistent structure.

#### Scenario: Modal display

- **WHEN** FormShell is rendered
- **THEN** it displays a semi-transparent backdrop overlay and a centered white container with rounded corners

#### Scenario: Modal close via backdrop

- **WHEN** the user clicks the backdrop outside the form container
- **THEN** the onClose callback is invoked

#### Scenario: Modal close via button

- **WHEN** the user clicks the close button in the header
- **THEN** the onClose callback is invoked

#### Scenario: Modal close via Escape key

- **WHEN** the modal is open and the user presses Escape
- **THEN** the onClose callback is invoked

---

### Requirement: FormShell Schema-Driven Fields

The FormShell SHALL render input fields dynamically based on a provided schema array.

#### Scenario: TextBox field rendering

- **WHEN** a field with type `textBox` is in the schema
- **THEN** a labeled text input is rendered with the specified placeholder

#### Scenario: LargeTextBox field rendering

- **WHEN** a field with type `largeTextBox` is in the schema
- **THEN** a labeled textarea is rendered with multiple rows

#### Scenario: DropdownBox field rendering

- **WHEN** a field with type `dropdownBox` is in the schema
- **THEN** a labeled select input is rendered with the provided options

#### Scenario: DateBox field rendering

- **WHEN** a field with type `dateBox` is in the schema
- **THEN** clicking the input opens a custom calendar picker popup

#### Scenario: DateRangeBox field rendering

- **WHEN** a field with type `dateRangeBox` is in the schema
- **THEN** two date inputs (start and end) are rendered with a custom calendar picker for each

#### Scenario: DateRangeBox validation

- **WHEN** the end date is earlier than the start date
- **THEN** an error message is displayed below the field

---

### Requirement: FormShell Conditional Fields

The FormShell SHALL support conditional field visibility based on other fields' values.

#### Scenario: Dependent field appears

- **WHEN** a field has `dependsOn` configured and the parent field's value matches
- **THEN** the dependent field becomes visible with an expand animation

#### Scenario: Dependent field hides

- **WHEN** a field has `dependsOn` configured and the parent field's value does not match
- **THEN** the dependent field is hidden and its value is cleared

#### Scenario: Collapsible section toggle

- **WHEN** a visible conditional field has `collapsible: true`
- **THEN** a collapse/expand button is displayed allowing the user to toggle the field visibility

---

### Requirement: FormShell Validation

The FormShell SHALL validate required fields before submission and display inline errors.

#### Scenario: Required field validation

- **WHEN** a required field is empty and the user submits
- **THEN** an error message is displayed below the field and submission is blocked

#### Scenario: Successful submission

- **WHEN** all required fields are filled and the user submits
- **THEN** the onSubmit callback is invoked with field values as key-value pairs

---

### Requirement: FormShell Accessibility

The FormShell SHALL be fully accessible via keyboard and assistive technologies.

#### Scenario: Focus trap

- **WHEN** the modal is open
- **THEN** keyboard focus is trapped within the modal

#### Scenario: Screen reader support

- **WHEN** a screen reader reads the modal
- **THEN** the title is announced as the dialog label via `aria-labelledby`

### Requirement: LoginPage

The admin application SHALL display a LoginPage when the user is not authenticated.

#### Scenario: Background display

- **WHEN** viewing the LoginPage
- **THEN** the background is `login_background.svg`, centered and covering the full screen

#### Scenario: Login card placement

- **WHEN** viewing the LoginPage
- **THEN** a `LoginWelcomeCard` is displayed at the center of the screen

#### Scenario: Login fields

- **WHEN** interacting with the `LoginWelcomeCard`
- **THEN** it contains email and password input fields

#### Scenario: Navigation after input

- **WHEN** both email and password fields are filled
- **THEN** clicking the login button navigates to `/assignment`

---

### Requirement: AssignmentPage

The admin application SHALL provide an AssignmentPage for worker-to-task assignment.

#### Scenario: Sidebar visibility

- **WHEN** viewing the AssignmentPage
- **THEN** the `RightSidebarTaskbar` is displayed

#### Scenario: Placeholder content

- **WHEN** viewing the AssignmentPage
- **THEN** placeholder text is shown (to be replaced in future)

---

### Requirement: EntriesManagementPage

The admin application SHALL provide an EntriesManagementPage for managing data entries.

#### Scenario: Sidebar visibility

- **WHEN** viewing the EntriesManagementPage
- **THEN** the `RightSidebarTaskbar` is displayed

#### Scenario: Placeholder content

- **WHEN** viewing the EntriesManagementPage
- **THEN** placeholder text is shown (to be replaced in future)

---

### Requirement: Page Routing

The admin application SHALL route users between pages via the sidebar and URL.

#### Scenario: Login route

- **WHEN** navigating to `/`
- **THEN** the LoginPage is displayed without the sidebar

#### Scenario: Assignment route

- **WHEN** navigating to `/assignment`
- **THEN** the AssignmentPage is displayed with the sidebar

#### Scenario: Entries route

- **WHEN** navigating to `/entries`
- **THEN** the EntriesManagementPage is displayed with the sidebar

#### Scenario: Sidebar navigation

- **WHEN** clicking a navigation item in the sidebar
- **THEN** the application navigates to the corresponding route

