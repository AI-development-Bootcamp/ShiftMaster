# Create Dropdown Menu Component

## Goal Description

Implement a valid, reusable `CreateDropdownMenu` component for the admin interface. This component will feature a "Create" button that toggles a floating dropdown menu with configurable actions, enabling scalable creation flows layout across different pages (e.g., Assignment, Employees, etc.).

## Detailed requirements

### 1. Functional Requirements
- **Trigger**: A "Create" button with a caret icon.
- **Dropdown**: Toggles visibility on trigger click.
- **Selection**: Selecting an item executes the callback and closes the menu.
- **Dismissal**: Closes on clicking outside or pressing ESC.
- **Configuration**: Fully driven by an `options` prop containing labels and callbacks.

### 2. Visual Specification
- **Button**: Blue filled, rounded corners, left-side caret.
- **Panel**: White background, soft shadow (elevation), rounded corners.
- **Placement**: Anchored to button (RTL support, typically bottom/start alignment).
- **Items**: Vertical list, hover effects (light gray), active states.

### 3. Usage
The component will be used in pages like `EmployeesManagmentPage`, `AssignmentPage`, etc., replacing ad-hoc buttons or adding new creation capabilities.

## Scoping

- **In Scope**:
    - `CreateDropdownMenu` component implementation.
    - Styling and animations (if any).
    - Unit/Integration tests for the component.
- **Out of Scope**:
    - Integration into specific pages (this proposal focuses on the component itself, integration is a separate step or usage). *Correction*: The user mentioned "User Flow" implies usage, ensuring it works. I will verify it using a demo or temporary usage, but refactoring *all* pages to use it might be a larger task unless specified. The requirement says "reusable UI component", so building the component is the primary change. Use of it is verification.
