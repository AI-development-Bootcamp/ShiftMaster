# month-locks Specification Delta

## MODIFIED Requirements

### Requirement: Month lock changes persist across year navigation

The system MUST preserve pending month lock changes when the user navigates between years in the modal.

#### Scenario: Toggle in year A, navigate to year B, navigate back to year A
- **Given** the user has toggled month 3 in year 2024 (pending change)
- **When** the user navigates to year 2025
- **And** the user navigates back to year 2024
- **Then** the toggle on month 3 in year 2024 is still visible
- **And** the change is still pending (not saved)

#### Scenario: Toggle in multiple years then save
- **Given** the user has toggled month 1 in year 2024
- **And** the user has navigated to year 2025 and toggled month 6
- **When** the user clicks Save
- **Then** both changes are sent to the server (one request per year)
- **And** the modal closes on success

#### Scenario: hasChanges detects changes across all years
- **Given** the user is viewing year 2025
- **And** the user has an unsaved toggle in year 2024
- **When** checking if there are pending changes
- **Then** `hasChanges` returns true

### Requirement: Discard reverts changes across all years

The system MUST revert all pending changes across all years when discarding.

#### Scenario: Discard after multi-year changes
- **Given** the user has toggled locks in years 2024 and 2025
- **When** the user discards changes (closes modal without saving)
- **And** the user reopens the modal
- **Then** both years show the original server state
- **And** no pending changes exist
