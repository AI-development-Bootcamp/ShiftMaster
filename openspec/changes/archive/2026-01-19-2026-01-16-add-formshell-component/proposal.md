# Proposal: Add FormShell Generic Form Component

## Summary
Implement `FormShell`, a schema-driven modal form system for the admin application. This enables rapid creation of various forms (tasks, projects, users) with consistent styling and behavior.

## Motivation
Currently, no reusable form infrastructure exists. Each new form would require building UI from scratch. FormShell provides:
- **Consistency**: Unified modal design, validation, and UX
- **Modularity**: Define forms via schema, not UI code
- **Maintainability**: Centralized styling and behavior

## Scope

### In Scope
- `FormShell` container component (modal overlay, header, body, footer)
- Sub-components: `TextBox`, `LargeTextBox`, `DropdownBox`, `DateBox`, `DateRangeBox`
- Custom date picker UI (calendar popup, not native browser input)
- Action components: `PrimaryActionButton`, `CloseFormButton`
- Schema-driven field rendering
- **Conditional fields**: Fields that appear/hide based on another field's value
- **Collapsible sections**: Expandable/collapsible groups for conditional fields
- Client-side validation (required, basic rules)
- RTL and accessibility support
- CSS styling matching existing design system

### Out of Scope
- Multi-step forms (wizard flows)
- **Dynamic field addition at runtime** (user-initiated, not schema-based)
- Auto-save functionality
- Integration with external form libraries (Formik, React Hook Form)

## Why
Building forms in the Admin panel is currently repetitive and error-prone, leading to inconsistent UI/UX. We need a standardized solution to streamline form creation, ensure accessibility, and maintain design consistency across the application.

## What Changes
*   **[NEW]** `FormShell` Component: A reusable modal form container (`admin/src/components/FormShell`).
*   **[NEW]** Field Components:
    *   `TextBox` (Text input)
    *   `LargeTextBox` (Textarea)
    *   `DropdownBox` (Custom Select)
    *   `DateBox` & `DateRangeBox` (Date pickers)
    *   `PasswordBox` (Password input with toggle)
*   **[NEW]** Schema System: `admin/src/components/forms` directory for defining form structures in TypeScript/JSON.
*   **[REF]** `EmployeesManagmentPage`: Updated to use the new `FormShell` for its "Create" actions.

## Impact
*   **Developers**: drastically reduced boilerplate for new forms; centralized logic for validation and style.
*   **Users**: Consistent experience across all forms (keyboard navigation, error states, visual design).
*   **Maintenance**: Updates to form styles or logic (e.g., a new validation rule) apply globally.

## Technical Approach
See `design.md` for architecture details.

## Acceptance Criteria
1. FormShell renders as centered modal with backdrop
2. Fields render dynamically based on schema
3. Validation errors display inline per field
4. Form submits via onSubmit callback with values object
5. Close button and backdrop click trigger onClose
6. All components are accessible (keyboard, ARIA)
