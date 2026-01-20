## ADDED Requirements

### Requirement: Entries Management Page Integration

The Entries Management Page SHALL display a Month Locks management button in the header for admin users.

#### Scenario: Page header with Month Lock button

- **WHEN** an admin user views the Entries Management Page
- **THEN** the page header displays the title, subtitle, AND a "Month Locks" button

#### Scenario: Button placement

- **WHEN** viewing the page header
- **THEN** the Month Locks button is positioned in the header alongside or near the title/subtitle area

#### Scenario: TableShell unaffected

- **WHEN** the Month Locks button is added
- **THEN** the TableShell component positioning and behavior remain unchanged
