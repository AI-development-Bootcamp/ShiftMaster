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

### Requirement: Create Dropdown Menu Component
The system **SHALL** provide a reusable `CreateDropdownMenu` component that toggles a list of actions.

#### Scenario: Basic Interaction
- **Given** a user is on a page with the CreateDropdownMenu component
- **When** the user clicks the "Create" button
- **Then** a dropdown menu should appear with a list of configured options
- **And** clicking an option should trigger the associated action and close the menu
- **And** clicking outside the menu should close it

