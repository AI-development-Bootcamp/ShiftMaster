# Proposal: ConfirmActionModal Component

## Why
The current admin interface lacks a standardized way to confirm actions, leading to inconsistent UX and code duplication. A reusable `ConfirmActionModal` is needed for safe handling of destructive actions (deletes), confirmations, and warnings, ensuring consistent accessibility, styling, and behavior across the application.

## What Changes
*   **New Component**: `ConfirmActionModal` in `admin/src/components/ConfirmActionModal/`.
*   **Design System**: Standardization of confirmation dialogs with variants (danger, primary, warning, info).
*   **Features**:
    *   RTL support.
    *   Backdrop with double-click to close.
    *   "Danger" variant for destructive actions.
    *   Loading state handling.
    *   Accessibility features (focus trap, ARIA).

## Impact
*   **Admin App**: New `ConfirmActionModal` available for use in all pages (e.g., Task management, User deletion).
*   **Developer Experience**: Simplified API for invoking confirmations.
*   **User Experience**: Consistent and accessible confirmation flows.
