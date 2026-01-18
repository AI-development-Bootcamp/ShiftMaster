# Tag Components

## ADDED Requirements

### Requirement: CSS Design Tokens

The application MUST define specific CSS custom properties (variables) to support the Tag and MultiTags components.

#### Scenario: Design Tokens Availability

- **GIVEN** the admin application is running
- **WHEN** accessing the global styles
- **THEN** the following CSS variables are defined with the specified values:
  - `--tag-bg`: `#E8E8E8`
  - `--tag-text`: `#202020`
  - `--multitag-bg`: `#F0F0F8`
  - `--multitag-text`: `#284868`
  - `--tooltip-bg`: `#383838`
  - `--tooltip-text`: `#F8F8F8`
  - `--chip-font-size`: `13px`
  - `--chip-line-height`: `16px`
  - `--chip-font-weight`: `500`
  - `--tooltip-font-size`: `13px`
  - `--tooltip-line-height`: `18px`
  - `--tooltip-font-weight`: `400`
  - `--chip-radius`: `9999px`
  - `--tooltip-radius`: `8px`
  - `--tag-height`: `32px`
  - `--tag-padding-x`: `12px`
  - `--tag-padding-y`: `0px`
  - `--tag-gap`: `8px`
  - `--multitag-height`: `28px`
  - `--multitag-min-width`: `34px`
  - `--multitag-padding-x`: `10px`
  - `--multitag-padding-y`: `0px`
  - `--tooltip-padding-x`: `12px`
  - `--tooltip-padding-y`: `10px`
  - `--tooltip-max-width`: `400px`
  - `--tooltip-shadow`: `0 8px 24px rgba(0,0,0,0.18)`
  - `--caret-size`: `8px`

### Requirement: Tag Component

The `Tag` component MUST be implemented as a read-only chip to display a user's full name.

#### Scenario: Tag Rendering

- **GIVEN** a Tag component with name "Israel Israeli"
- **WHEN** rendered
- **THEN** it displays the text "Israel Israeli"
- **AND** it applies the `--tag-bg` background and `--tag-text` color
- **AND** it has a height of `--tag-height`
- **AND** it has `padding-inline` of `--tag-padding-x`
- **AND** it does NOT display an "X" icon (close button)
- **AND** it has `direction: rtl` and `text-align: right`
- **AND** it handles text overflow with ellipsis.

### Requirement: MultiTags Component

The `MultiTags` component MUST be implemented to display a count of users and a tooltip with their names on hover.

#### Scenario: MultiTags Count Display

- **GIVEN** a list of 5 people passed to MultiTags
- **WHEN** rendered
- **THEN** it displays "5+"
- **AND** it uses the `--multitag-bg` background and `--multitag-text` color
- **AND** it has a height of `--multitag-height`
- **AND** it has a minimum width of `--multitag-min-width`.

#### Scenario: Empty List Handling

- **GIVEN** an empty list of people
- **WHEN** MultiTags is rendered
- **THEN** it renders nothing (null).

#### Scenario: Tooltip Display on Hover

- **GIVEN** a MultiTags component representing 3 people: "Alice", "Bob", "Charlie"
- **WHEN** the user hovers over the chip
- **THEN** a tooltip appears
- **AND** the tooltip contains "Alice, Bob, Charlie"
- **AND** the tooltip uses `--tooltip-bg` background and `--tooltip-text` color
- **AND** the tooltip has a caret pointing to the chip.

#### Scenario: Disabled State

- **GIVEN** a MultiTags component with `disabled=true`
- **WHEN** rendered
- **THEN** it still displays the count (e.g., "5+")
- **BUT** hovering over it DOES NOT show the tooltip.
