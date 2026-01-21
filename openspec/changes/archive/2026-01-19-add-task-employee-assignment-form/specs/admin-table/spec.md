## ADDED Requirements

### Requirement: Selection Column Type

TableShell SHALL support a `selection` column type for multi-row selection.

#### Scenario: Selection column definition

- **WHEN** a column is defined with `type: 'selection'`
- **THEN** the column SHALL render a checkbox in each data row
- **AND** the header cell SHALL be empty (no text, no icon)

#### Scenario: Selection column position in RTL

- **WHEN** TableShell is rendered in RTL mode with a selection column
- **THEN** the selection column SHALL appear as the first visual column (rightmost)

---

### Requirement: Selection State Management

TableShell SHALL accept external selection state via props.

#### Scenario: Selection props

- **WHEN** TableShell receives `selectedRowKeys` and `onSelectionChange` props
- **THEN** checkboxes SHALL reflect the selection state from `selectedRowKeys`
- **AND** checkbox changes SHALL invoke `onSelectionChange` with updated keys

#### Scenario: Selection change callback

- **WHEN** a user clicks a row's selection checkbox
- **THEN** `onSelectionChange` SHALL be called with a `Set<string>` of all selected row IDs
- **AND** the callback SHALL NOT include full row objects (IDs only)

---

### Requirement: Selection Persistence Across Pagination

Selection state SHALL persist when navigating between pages.

#### Scenario: Page change preserves selection

- **GIVEN** the user has selected rows on page 1
- **WHEN** the user navigates to page 2
- **THEN** the selections from page 1 SHALL remain in `selectedRowKeys`

#### Scenario: Selection visible on return

- **GIVEN** the user selected rows on page 1 and navigated to page 2
- **WHEN** the user returns to page 1
- **THEN** previously selected rows SHALL still show checked checkboxes

#### Scenario: Submit includes all pages

- **WHEN** submit is triggered after selecting rows across multiple pages
- **THEN** all selected rows from all pages SHALL be included

---

### Requirement: Selection Cell Rendering

Selection cells SHALL display a checkbox with appropriate accessibility.

#### Scenario: Checkbox display

- **WHEN** a selection column is rendered
- **THEN** each row SHALL display a checkbox aligned to the cell center

#### Scenario: Checkbox accessibility

- **WHEN** a selection checkbox is rendered
- **THEN** it SHALL have an `aria-label` attribute for screen readers
- **AND** the checkbox SHALL be keyboard accessible (Space to toggle)

#### Scenario: Checkbox state sync

- **WHEN** `selectedRowKeys` contains a row's ID
- **THEN** that row's checkbox SHALL be checked
- **WHEN** `selectedRowKeys` does not contain a row's ID
- **THEN** that row's checkbox SHALL be unchecked

---

### Requirement: Selection Column Header

The selection column header SHALL be empty.

#### Scenario: Empty header cell

- **WHEN** TableShell renders a selection column header
- **THEN** the header cell SHALL contain no text
- **AND** the header cell SHALL contain no icons
- **AND** the header cell SHALL have a fixed narrow width
