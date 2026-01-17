# Implementation Tasks

1.  [x] **Scaffold Component Structure**
    *   Create `admin/src/components/ConfirmActionModal` directory.
    *   Create `ConfirmActionModal.tsx`, `ConfirmActionModal.css`, `types.ts`, `index.ts`.

2.  [x] **Implement Styling**
    *   Define CSS variables/classes for backdrop, container, variants (`danger`, `primary`, etc.).
    *   Implement RTL layout (Icon right, Text left).

3.  [x] **Implement Component Logic**
    *   Props interface (`ConfirmActionModalProps`).
    *   Render logic (backdrop, conditional rendering based on `isOpen`).
    *   Handlers for `onConfirm` (async/loading), `onCancel`.
    *   Backdrop double-click and ESC key handlers.

4.  [x] **Accessibility & Polish**
    *   Add `role="dialog"`, `aria-modal="true"`.
    *   Ensure focus trap (or at least focus management on open).

5.  [x] **Verification**
    *   Add a test case or storybook entry (if applicable) or verify manually in `EmployeesManagmentPage` (adding a dummy delete button).
