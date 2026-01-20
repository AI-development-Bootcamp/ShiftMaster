## ADDED Requirements

### Requirement: TaskEmployeeAssignmentForm Component

The admin UI SHALL provide a form component for assigning employees to tasks.

#### Scenario: Form purpose

- **GIVEN** a task context (client → project → task)
- **WHEN** TaskEmployeeAssignmentForm is rendered
- **THEN** it SHALL display a searchable table of employees with multi-select capability
- **AND** allow submission of selected employees

---

### Requirement: FormShell-like Modal Structure

TaskEmployeeAssignmentForm SHALL follow the FormShell modal pattern.

#### Scenario: Modal overlay

- **WHEN** the form is rendered
- **THEN** it SHALL display as a modal overlay above the page content
- **AND** it SHALL have a backdrop that dims the page content

#### Scenario: Close button

- **WHEN** the form header is rendered
- **THEN** it SHALL include a close (X) button
- **AND** clicking the close button SHALL invoke `onClose` callback

#### Scenario: Focus trap

- **WHEN** the modal is open
- **THEN** keyboard focus SHALL be trapped within the modal
- **AND** pressing Escape SHALL close the modal

---

### Requirement: Form Layout (RTL)

TaskEmployeeAssignmentForm SHALL follow RTL layout with specific structure.

#### Scenario: RTL direction

- **WHEN** the form is rendered
- **THEN** it SHALL have `dir="rtl"`
- **AND** all text SHALL align to the right

#### Scenario: Layout structure

- **WHEN** the form is rendered
- **THEN** it SHALL contain a header, content area, and footer
- **AND** the header SHALL display the title, close button, and context path
- **AND** the content area SHALL contain search input and TableShell
- **AND** the footer SHALL contain the submit button

---

### Requirement: Header with Context Path

The form header SHALL display the title and entity breadcrumb.

#### Scenario: Header title

- **WHEN** the form header is rendered
- **THEN** it SHALL display the title "שייך עובד חדש למשימה"
- **AND** the subtitle "כאן תוכל לשייך עובד חדש מהמאגר לטובת"

#### Scenario: Context pills display

- **WHEN** the form is provided with a `contextPath` prop
- **THEN** the header SHALL display pills in order: [Client] → [Project] → [Task]
- **AND** pills SHALL be capsule-shaped and read-only (not clickable)

---

### Requirement: Employee Search

The form SHALL provide a search input for filtering employees.

#### Scenario: Search input display

- **WHEN** the form is rendered with `searchEnabled !== false`
- **THEN** it SHALL display a search input with placeholder "חיפוש לפי שם עובד"
- **AND** the input SHALL include a search icon

#### Scenario: Client-side filtering

- **WHEN** the user types in the search input
- **THEN** filtering SHALL occur after a 300ms debounce
- **AND** filtering SHALL be case-insensitive on the `fullName` field

#### Scenario: Server-side search delegation

- **WHEN** `onSearchChange` prop is provided
- **THEN** the debounced search query SHALL be passed to `onSearchChange`
- **AND** the parent component SHALL update the `rows` prop accordingly

---

### Requirement: Employee Table with Selection

The form SHALL display employees in a TableShell with selection column.

#### Scenario: Mandatory TableShell usage

- **WHEN** the employee table is rendered
- **THEN** it SHALL use the TableShell component (not a custom table)

#### Scenario: Table columns

- **WHEN** the table is rendered
- **THEN** it SHALL display columns in order (RTL): Selection, Full Name, Type, Role
- **AND** the selection column header SHALL be empty

#### Scenario: Multi-select functionality

- **WHEN** the user clicks row checkboxes
- **THEN** multiple rows can be selected simultaneously
- **AND** selection state SHALL be maintained during search filtering

---

### Requirement: Selection State Persistence

Selection SHALL persist across filtering and pagination operations.

#### Scenario: Selection survives filtering

- **GIVEN** the user has selected employees
- **WHEN** the user applies a search filter that hides some selected employees
- **THEN** the selection state SHALL be preserved for hidden employees
- **AND** submit SHALL include all selected employees (visible and hidden)

#### Scenario: Selection survives pagination

- **GIVEN** the user has selected employees on page 1
- **WHEN** the user navigates to page 2
- **THEN** the selections from page 1 SHALL remain in state
- **AND** returning to page 1 SHALL show previously selected rows as checked

---

### Requirement: Submit Button

The form footer SHALL contain a single action button.

#### Scenario: Button text

- **WHEN** the footer is rendered
- **THEN** it SHALL display a button with text "שייך עובד למשימה"
- **AND** the button SHALL span full width

#### Scenario: Button disabled state

- **WHEN** no employees are selected
- **THEN** the submit button SHALL be disabled
- **WHEN** `isLoading` is true
- **THEN** the submit button SHALL be disabled

#### Scenario: Submit callback

- **WHEN** the user clicks the submit button with employees selected
- **THEN** `onSubmit` SHALL be called with an array of selected `EmployeeRow` objects
- **AND** the button SHALL show loading state during async submission

---

### Requirement: Loading State

The form SHALL display loading state appropriately.

#### Scenario: Table loading

- **WHEN** `isLoading` prop is true
- **THEN** TableShell SHALL display skeleton rows
- **AND** the submit button SHALL be disabled

---

### Requirement: Empty State

The form SHALL handle empty data gracefully.

#### Scenario: No employees

- **WHEN** `rows` is empty or filtering returns no results
- **THEN** TableShell SHALL display empty state with text "לא נמצאו עובדים"

---

### Requirement: Error State

The form SHALL display errors when provided.

#### Scenario: Error display

- **WHEN** `error` prop is provided
- **THEN** an inline alert SHALL be displayed above the table
- **AND** the alert SHALL NOT be inside TableShell
