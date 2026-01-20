## ADDED Requirements

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
