# Design: ConfirmActionModal

## Context
The application needs a consistent UI for confirming user actions. Currently, ad-hoc solutions or browser alerts might be used, which are poor for UX and branding.

## Goals
*   **Consistency**: Unified look and feel for all confirmation dialogs.
*   **Safety**: Explicit "danger" variant for destructive actions to prevent accidental data loss.
*   **Accessibility**: proper ARIA roles and focus management.
*   **RTL Support**: Native right-to-left layout for Hebrew interface.

## Non-Goals
*   Replacing complex forms (use `FormShell` for that).
*   Global state manager / Context API based modal invocation (calling it imperatively like `confirm(...)`) - sticking to declarative `isOpen` prop for now to match React patterns used in `FormShell`.

## Decisions
*   **Controlled Component**: The modal will be a controlled component receiving `isOpen`, `onConfirm`, and `onCancel` props. This matches the existing `FormShell` pattern.
*   **Variants**: `danger` (red), `primary` (blue), `warning` (orange), `info` (neutral).
*   **Layout**: Icon on the right, text on the left (RTL). Two buttons at the bottom: Confirm (right/colored), Cancel (left/neutral).

## Risks & Trade-offs
*   **Modal Stacking**: If a confirmation is needed *on top* of a `FormShell`, z-index management will be crucial.
*   **Declarative vs Imperative**: Declarative usage (controlled state) requires parent components to maintain `isConfirmOpen` state, which can be boilerplate-heavy. However, it is more explicit and React-idiomatic than a global imperative service.

## Open Questions
*   Default icons for each variant? (Will use placeholders or commonly available icons for now).
