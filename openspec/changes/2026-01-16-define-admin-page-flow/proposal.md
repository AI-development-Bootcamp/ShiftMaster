# Define Admin Page Flow

## Summary

Define the three primary pages for the admin application and the navigation flow between them:

1. **LoginPage** – Initial authentication page (mock login for now).
2. **AssignmentPage** – Worker-to-task assignment (empty shell).
3. **EntriesManagementPage** – Data entry management (empty shell).

Pages 2 and 3 share the existing `RightSidebarTaskbar` component. Navigation between them uses the sidebar.

## Motivation

Establishing clear page structure before implementing detailed features ensures consistent UX and routing.

## Scope

- Add three new pages under `admin/src/pages/`.
- Update `App.tsx` routing.
- `LoginPage` uses `login_background.svg` and a new `LoginWelcomeCard` component.
- `AssignmentPage` and `EntriesManagementPage` are empty but share the sidebar layout.

## Out of Scope

- Actual authentication logic.
- Backend integration.
- Detailed content for AssignmentPage and EntriesManagementPage.

## Related Specs

- `frontend-admin`
