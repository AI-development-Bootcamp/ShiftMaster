# admin-table Specification

## Purpose
TBD - created by archiving change implement-table-shell. Update Purpose after archive.
## Requirements
### Requirement: TableShell Component Identity

The TableShell component SHALL be a presentation-only, controlled table component for Admin UI that displays paginated data with RTL layout.

#### Scenario: Component initialization

- **WHEN** TableShell is rendered with valid props
- **THEN** it SHALL display a table with header, body (or empty state), and optionally footer
- **AND** it SHALL apply RTL text direction

---

### Requirement: Fixed Table Sizing

The TableShell container SHALL maintain a fixed size relative to viewport dimensions.

#### Scenario: Viewport-relative height

- **WHEN** TableShell is rendered
- **THEN** the table height SHALL be 80.185% of viewport height (866:1080 ratio)
- **AND** this height SHALL remain constant across loading, normal, and empty states

#### Scenario: Fixed width

- **WHEN** TableShell is rendered
- **THEN** the table width SHALL be fixed and not change based on content or column count

---

### Requirement: Header Specification

The TableShell header SHALL always be visible and maintain fixed height.

#### Scenario: Header visibility

- **WHEN** TableShell is in any state (loading, normal, empty)
- **THEN** the header row SHALL be visible

#### Scenario: Header height

- **WHEN** TableShell calculates header height
- **THEN** HeaderHeight SHALL equal 0.75 × RowHeight

#### Scenario: Header alignment

- **WHEN** TableShell is positioned on page
- **THEN** the top edge of the header SHALL align with the top of the first navigation item in the Sidebar

---

### Requirement: Column Width Distribution

TableShell columns SHALL have equal width distribution.

#### Scenario: Equal column widths

- **WHEN** TableShell renders N columns
- **THEN** each column width SHALL equal TableWidth / N
- **AND** column widths SHALL not resize based on content

---

### Requirement: Row Specification

All data rows SHALL have uniform, fixed height.

#### Scenario: Fixed row height

- **WHEN** TableShell renders data rows
- **THEN** all rows SHALL have identical height regardless of content

#### Scenario: Vertical cell alignment

- **WHEN** cells are rendered within rows
- **THEN** cell content SHALL be vertically centered within the row

---

### Requirement: Footer Pagination

TableShell SHALL display pagination controls in the footer when multiple pages exist.

#### Scenario: Footer visibility with multiple pages

- **WHEN** totalPages > 1
- **THEN** the pagination footer SHALL be visible
- **AND** footer height SHALL equal RowHeight

#### Scenario: Footer hidden for single page

- **WHEN** totalPages <= 1
- **THEN** the pagination footer SHALL NOT be visible
- **AND** the body area SHALL expand to fill the vacated space

#### Scenario: Page change callback

- **WHEN** user clicks pagination control
- **THEN** onPageChange callback SHALL be invoked with the new page number

---

### Requirement: Text Cell Type

Text cells SHALL display single-line content with ellipsis overflow.

#### Scenario: Single-line display

- **WHEN** a column is defined as type 'text'
- **THEN** the cell SHALL display content on a single line

#### Scenario: Overflow handling

- **WHEN** text content exceeds cell width
- **THEN** content SHALL be truncated with ellipsis

---

### Requirement: Radio Cell Type

Radio cells SHALL display inline radio options for enum values.

#### Scenario: Inline radio display

- **WHEN** a column is defined as type 'radio' with options
- **THEN** the cell SHALL display radio buttons for each option

#### Scenario: Immediate value change

- **WHEN** user selects a radio option
- **THEN** onRadioChange callback SHALL be invoked immediately with the new value
- **AND** no confirmation dialog SHALL be shown

---

### Requirement: Boolean Cell Type

Boolean cells SHALL display a checkbox.

#### Scenario: Checkbox display

- **WHEN** a column is defined as type 'boolean'
- **THEN** the cell SHALL display a checkbox

#### Scenario: Immediate toggle

- **WHEN** user clicks the checkbox
- **THEN** onBoolChange callback SHALL be invoked immediately
- **AND** no confirmation dialog SHALL be shown

---

### Requirement: Actions Cell Type

Actions cells SHALL display action buttons (Edit, Delete, Add).

#### Scenario: Action buttons display

- **WHEN** a column is defined as type 'actions' with rowActions config
- **THEN** the cell SHALL display configured action buttons

#### Scenario: Delete confirmation

- **WHEN** user clicks Delete button
- **THEN** a confirmation dialog SHALL be shown before invoking the callback

#### Scenario: Edit and Add without confirmation

- **WHEN** user clicks Edit or Add button
- **THEN** the respective callback SHALL be invoked immediately without confirmation

---

### Requirement: Tags Cell Type

Tags cells SHALL display multiple tags with overflow indicator.

#### Scenario: Tags display

- **WHEN** a column is defined as type 'tags' with tag array
- **THEN** the cell SHALL display as many tags as fit within the cell width

#### Scenario: Overflow indicator

- **WHEN** not all tags fit within cell width
- **THEN** an "N+" indicator SHALL be shown where N is the count of hidden tags

#### Scenario: Tooltip on hover

- **WHEN** user hovers over the tags cell
- **THEN** a tooltip SHALL display the names of all tags (RTL format)

---

### Requirement: Server-Side Sorting

TableShell SHALL support server-side sorting via header clicks.

#### Scenario: Sort toggle

- **WHEN** user clicks a sortable column header
- **THEN** onSortChange callback SHALL be invoked with updated sort state

#### Scenario: Sort indicator display

- **WHEN** a column is sorted
- **THEN** the header SHALL display a sort direction indicator (↑ for asc, ↓ for desc)

---

### Requirement: Empty State Rendering

When table has no data, the entire body area SHALL display the empty state image.

#### Scenario: Empty condition

- **WHEN** totalItems === 0 AND isLoading === false
- **THEN** the table SHALL be in empty state

#### Scenario: Empty state image display

- **WHEN** table is in empty state
- **THEN** the body area SHALL display empty_space.svg
- **AND** the image SHALL fill 100% of body height
- **AND** the image SHALL be centered horizontally and vertically
- **AND** the image SHALL maintain original aspect ratio
- **AND** the image SHALL NOT overflow table boundaries

#### Scenario: No additional elements in empty state

- **WHEN** table is in empty state
- **THEN** no data rows, placeholder text, or CTA buttons SHALL be displayed
- **AND** header SHALL remain visible
- **AND** footer SHALL NOT be displayed

---

### Requirement: Loading State Rendering

When data is loading, TableShell SHALL display skeleton rows.

#### Scenario: Skeleton display

- **WHEN** isLoading === true
- **THEN** the body SHALL display skeleton rows matching pageSize count
- **AND** header SHALL remain visible
- **AND** table height SHALL not change

#### Scenario: Loading prevents empty state

- **WHEN** isLoading === true AND totalItems === 0
- **THEN** loading state SHALL be shown, NOT empty state

---

### Requirement: Layout Stability

TableShell SHALL maintain consistent dimensions across all state transitions.

#### Scenario: No layout shift on state change

- **WHEN** table transitions between empty, loading, and normal states
- **THEN** total table height and width SHALL remain constant
- **AND** no visible layout jumps SHALL occur

---

### Requirement: Data Source Policy

TableShell SHALL be API-ready with mock data support.

#### Scenario: Mock data contract

- **WHEN** data is provided to TableShell
- **THEN** it SHALL follow the standard pagination response format:
  ```json
  {
    "items": [],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalItems": 0,
      "totalPages": 0
    }
  }
  ```

#### Scenario: Controlled component

- **WHEN** TableShell receives data
- **THEN** it SHALL NOT fetch data internally
- **AND** all data operations SHALL be handled by parent component

