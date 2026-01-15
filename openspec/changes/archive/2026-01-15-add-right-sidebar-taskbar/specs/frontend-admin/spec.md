## ADDED Requirements

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
