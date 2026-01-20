# month-locks Specification

## Purpose
TBD - created by archiving change refactor-month-lock-batch-update. Update Purpose after archive.
## Requirements
### Requirement: Batch update for month locks
The system MUST allow users to toggle multiple month locks locally and save them in a single batch operation.

#### Scenario: User toggles a month lock
- **Given** the user has opened the Month Lock modal
- **When** the user clicks a month tile
- **Then** the tile's visual state toggles immediately
- **And** NO network request is sent to the server (no console log of API call)

#### Scenario: User saves changes
- **Given** the user has made changes to month locks
- **When** the user clicks "Save"
- **Then** a batch API request (console log) is triggered with all changes
- **And** the modal closes upon success

#### Scenario: User discards changes
- **Given** the user has made changes
- **When** the user closes the modal (via click outside or X)
- **Then** the changes are discarded
- **And** re-opening the modal shows the original server state

