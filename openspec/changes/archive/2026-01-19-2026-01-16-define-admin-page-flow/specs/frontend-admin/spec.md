# frontend-admin Spec Delta

## ADDED Requirements

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
