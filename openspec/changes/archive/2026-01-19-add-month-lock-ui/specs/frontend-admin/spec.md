# frontend-admin Delta

## ADDED Requirements

### Requirement: Month Lock Management UI

The admin application SHALL provide a Month Lock management interface accessible only to admin users from the Entries Management Page.

#### Scenario: Admin-only button visibility

- **WHEN** an admin user views the Entries Management Page
- **THEN** a "Month Locks" button is displayed in the page header

#### Scenario: Non-admin button hidden

- **WHEN** a non-admin user views the Entries Management Page
- **THEN** the "Month Locks" button is not rendered (not just disabled)

#### Scenario: Modal open on button click

- **WHEN** an admin clicks the "Month Locks" button
- **THEN** a modal overlay opens displaying the month lock management interface

### Requirement: Month Lock Modal

The Month Lock modal SHALL display a year navigator and a 12-month grid for lock management.

#### Scenario: Modal structure

- **WHEN** the modal is open
- **THEN** it displays a year navigation header, a 12-month tile grid, and close controls (X button, overlay click, ESC key)

#### Scenario: RTL layout and Hebrew text

- **WHEN** viewing the modal
- **THEN** all text is in Hebrew, layout is RTL, and month names are displayed in full (ינואר, פברואר, ..., דצמבר)

#### Scenario: Close via X button

- **WHEN** the admin clicks the X button in the modal
- **THEN** the modal closes

#### Scenario: Close via overlay click

- **WHEN** the admin clicks outside the modal content area
- **THEN** the modal closes

#### Scenario: Close via ESC key

- **WHEN** the admin presses the ESC key while the modal is open
- **THEN** the modal closes

#### Scenario: Focus trap

- **WHEN** the modal is open
- **THEN** keyboard focus is trapped within the modal and does not escape to background content

### Requirement: Year Navigation

The modal SHALL allow navigation between years with no past limit and optional future navigation.

#### Scenario: Current year display

- **WHEN** the modal opens
- **THEN** the current year is displayed in the year navigator

#### Scenario: Previous year navigation

- **WHEN** the admin clicks the "previous year" button
- **THEN** the year decrements by 1 and the month grid updates for that year

#### Scenario: Next year navigation

- **WHEN** the admin clicks the "next year" button
- **THEN** the year increments by 1 and the month grid updates for that year

#### Scenario: Infinite past navigation

- **WHEN** the admin navigates to past years
- **THEN** there is no lower limit on year selection

### Requirement: Month Lock Toggle

Each month tile SHALL display the current lock state and allow toggling between locked and unlocked.

#### Scenario: Locked month display

- **WHEN** a month is locked (exists in mockMonthLocks data)
- **THEN** the tile displays with a red background

#### Scenario: Unlocked month display

- **WHEN** a month is unlocked (does not exist in mockMonthLocks data)
- **THEN** the tile displays with a gray background

#### Scenario: Toggle to locked

- **WHEN** an admin clicks an unlocked month tile
- **THEN** the tile immediately changes to red (locked) and a "prepare create" payload is logged to console with `{ year, month, lockedByUserId }`

#### Scenario: Toggle to unlocked

- **WHEN** an admin clicks a locked month tile
- **THEN** the tile immediately changes to gray (unlocked) and a "prepare delete" payload is logged to console with `{ lockId }` or `{ year, month }`

#### Scenario: Optimistic UI update

- **WHEN** a month is toggled
- **THEN** the UI updates immediately without waiting for server confirmation

### Requirement: Loading States

The modal SHALL display skeleton loading states during data fetches.

#### Scenario: Year transition loading

- **WHEN** the admin changes the year
- **THEN** a skeleton grid (12 tiles) is displayed while loading lock data for the new year

#### Scenario: Initial load skeleton

- **WHEN** the modal first opens
- **THEN** a skeleton grid is displayed while loading lock data for the current year

### Requirement: Mock Data Integration

The Month Lock UI SHALL consume data from `admin/src/mocks/monthLocks.ts` via an API-ready abstraction layer.

#### Scenario: Mock data consumption

- **WHEN** the modal loads lock data
- **THEN** it uses a `useMonthLocks(year)` hook that reads from mockMonthLocks.ts

#### Scenario: No direct mock imports in components

- **WHEN** examining component code
- **THEN** components do not import mockMonthLocks.ts directly; they use the hook abstraction

#### Scenario: API-ready hook structure

- **WHEN** reviewing the useMonthLocks hook
- **THEN** it returns `{ locks, isLoading, toggleLock }` with a structure compatible for future API integration

### Requirement: Internationalization

All Month Lock UI text SHALL be translated using the i18n system with Hebrew translations.

#### Scenario: Month names in Hebrew

- **WHEN** viewing month tiles
- **THEN** month names are displayed in Hebrew using i18n keys (e.g., `t('monthNames.january')` → "ינואר")

#### Scenario: UI labels in Hebrew

- **WHEN** viewing the modal and button
- **THEN** all UI text (button label, modal title, etc.) uses Hebrew translations from `admin/src/i18n/locales/he.json`
