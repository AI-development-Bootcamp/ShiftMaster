# timer-entry-workflow Specification Delta

## Purpose

Define the integrated workflow between the timer component and daily entry management, enabling users to seamlessly track time and create entries with pre-populated start/end times.

## ADDED Requirements

### Requirement: Timer Start Creates Entry

When the user starts the timer, the system SHALL create a new in-progress entry in the daily entry list for the current day.

#### Scenario: User starts timer for the first time today

- **GIVEN** the user is on the HomePage
- **AND** no timer is currently running
- **WHEN** the user clicks the timer start button
- **THEN** the timer begins counting from 00:00:00
- **AND** a new entry appears in the daily entry list for today's date
- **AND** the entry displays a "running" status badge
- **AND** the entry shows live elapsed time synchronized with the timer

#### Scenario: User starts timer while another timer is running

- **GIVEN** a timer is already running
- **WHEN** the user clicks the timer start button
- **THEN** the existing timer stops
- **AND** the running entry is removed from the list
- **AND** a new timer starts immediately
- **AND** a new running entry is created for the current time

### Requirement: Running Entry Visual Indicators

Running entries SHALL be visually distinct from completed or absence entries in the daily entry list.

#### Scenario: Display running entry

- **GIVEN** a timer is running
- **WHEN** viewing the daily entry list
- **THEN** the running entry displays:
  - Today's date and day name
  - "Running" status badge with distinctive styling
  - Live elapsed time (updating every second)
  - Visual indicator (e.g., subtle animation or border)
- **AND** the entry cannot be expanded or collapsed
- **AND** the entry cannot be manually edited while running

#### Scenario: Running entry persistence in view

- **GIVEN** a timer is running with a visible entry
- **WHEN** the user navigates to a different month
- **THEN** the running entry is no longer visible
- **WHEN** the user navigates back to the current month
- **THEN** the running entry reappears with correct elapsed time

### Requirement: Timer Stop Opens Manual Report Modal

When the user stops the timer, the system SHALL automatically open the Manual Report Modal pre-populated with the captured time data.

#### Scenario: User stops timer after working

- **GIVEN** a timer has been running for at least 1 second
- **AND** the start time was captured as START_TIME
- **WHEN** the user clicks the timer stop button
- **THEN** the timer stops immediately
- **AND** the running entry is removed from the daily entry list
- **AND** the Manual Report Modal opens automatically
- **AND** the modal is on the "work" tab (not "absence")
- **AND** the work date field is set to today
- **AND** the start time field displays START_TIME
- **AND** the end time field displays the current time when stopped
- **AND** the elapsed time matches the timer duration

#### Scenario: User stops timer immediately (zero duration)

- **GIVEN** a timer has just started (elapsed time < 1 second)
- **WHEN** the user clicks the timer stop button
- **THEN** the timer stops
- **AND** the running entry is removed
- **AND** the Manual Report Modal opens with start and end times nearly identical
- **AND** the system allows saving even with minimal duration

### Requirement: Manual Report Modal Pre-population

The Manual Report Modal SHALL accept and display pre-populated start and end times when opened via timer stop.

#### Scenario: Modal opened with pre-filled times

- **GIVEN** the Manual Report Modal receives `prefillStartTime` and `prefillEndTime` props
- **WHEN** the modal opens
- **THEN** the WorkTab component displays the pre-filled start time
- **AND** the WorkTab component displays the pre-filled end time
- **AND** both time fields are editable by the user
- **AND** the total hours calculation reflects the pre-filled times

#### Scenario: User modifies pre-filled times

- **GIVEN** the modal is open with pre-filled start/end times
- **WHEN** the user changes the start time
- **THEN** the total hours recalculates automatically
- **WHEN** the user changes the end time
- **THEN** the total hours recalculates automatically
- **AND** the changes are validated against project time format requirements

### Requirement: Entry Completion and Cancellation

Users SHALL be able to complete the entry with task assignments or cancel without saving.

#### Scenario: User completes timer entry

- **GIVEN** the Manual Report Modal is open with pre-filled times from timer
- **WHEN** the user adds task assignments
- **AND** the user clicks "Save"
- **THEN** the entry is created in the backend
- **AND** the modal closes
- **AND** the completed entry appears in the daily entry list
- **AND** the timer resets to 00:00:00
- **AND** the timer is stopped

#### Scenario: User cancels timer entry

- **GIVEN** the Manual Report Modal is open with pre-filled times from timer
- **WHEN** the user clicks "Close" or "Cancel" without saving
- **THEN** the modal closes
- **AND** no entry is created or saved
- **AND** the running entry does not reappear in the list
- **AND** the timer resets to 00:00:00
- **AND** the timer is stopped

### Requirement: Running Status Badge

The StatusBadge component SHALL support a "running" status type with distinctive styling.

#### Scenario: Display running status

- **GIVEN** an entry has `status: 'running'`
- **WHEN** the StatusBadge component renders
- **THEN** it displays a badge with "running" text (or translated equivalent)
- **AND** the badge uses distinctive styling (e.g., orange color, pulsing animation)
- **AND** the badge is visually distinct from "complete", "incomplete", and absence statuses

### Requirement: Time Synchronization

The elapsed time displayed in the running entry SHALL remain synchronized with the timer display in the navigation bar.

#### Scenario: Elapsed time consistency

- **GIVEN** a timer is running
- **WHEN** comparing the timer display in the bottom navigation
- **AND** the elapsed time in the running entry card
- **THEN** both displays show the same time
- **AND** both update every second
- **AND** no drift occurs between the two displays

## MODIFIED Requirements

None. This change adds new capabilities without modifying existing requirements.

## REMOVED Requirements

None. All existing functionality remains intact.

## Dependencies

- Requires existing `ManualReportModal` component from `manual-report` feature
- Requires existing `DailyEntryCard` component
- Requires existing `StatusBadge` component
- Requires existing `TimerDisplay` component
- Requires `HomePage` timer logic (already implemented)

## Notes

- This specification focuses on the MVP integration
- Future enhancements may include:
  - Persisting timer state to localStorage
  - Restoring running timer on app reload
  - Cross-device timer synchronization via backend
  - Maximum timer duration limits
  - Confirmation dialog for long-running timers before stop
