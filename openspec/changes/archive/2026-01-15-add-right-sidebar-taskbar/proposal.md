# Change: Add Right Sidebar Navigation Component

## Why

The admin application needs a consistent navigation mechanism for users to move between different management screens (clients, projects, time reporting, etc.) after login. A fixed sidebar provides always-visible navigation and reinforces the application's visual identity.

## What Changes

- Add `RightSidebarTaskbar` component with three sections: Header (logo), Navigation (screen list), and Footer (user profile)
- Add navigation color tokens to global CSS variables
- Create reusable `NavItem` sub-component for menu items
- Integrate sidebar into authenticated routes layout
- Support RTL layout with right-aligned text and left-side active indicator

## Impact

- Affected specs: `frontend-admin`
- Affected code:
  - `admin/src/components/RightSidebarTaskbar/`
  - `admin/src/styles/global.css` (new color variables)
  - `admin/src/App.tsx` (layout integration)