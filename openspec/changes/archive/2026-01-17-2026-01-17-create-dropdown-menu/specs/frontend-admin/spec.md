## ADDED Requirements

### UI Options

### Requirement: Create Dropdown Menu Component
The system **SHALL** provide a reusable `CreateDropdownMenu` component that toggles a list of actions.

#### Scenario: Basic Interaction
- **Given** a user is on a page with the CreateDropdownMenu component
- **When** the user clicks the "Create" button
- **Then** a dropdown menu should appear with a list of configured options
- **And** clicking an option should trigger the associated action and close the menu
- **And** clicking outside the menu should close it
