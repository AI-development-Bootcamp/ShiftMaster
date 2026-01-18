## 1. Setup & Styling

- [x] 1.1 Add navigation color variables to `global.css` (`--color-nav-bg`, `--color-nav-text`, `--color-nav-active`, `--color-nav-hover`)
- [x] 1.2 Create `RightSidebarTaskbar/` directory structure with `index.ts`, `RightSidebarTaskbar.tsx`, `RightSidebarTaskbar.css`

## 2. Component Implementation

- [x] 2.1 Create `RightSidebarTaskbar` container component with fixed positioning and flex column layout
- [x] 2.2 Implement Header section with company logo from `/assets/abra_logo.svg`
- [x] 2.3 Implement Navigation section with `NavItem` sub-component
- [x] 2.4 Implement Footer section with user name, role, and avatar placeholder
- [x] 2.5 Add active state styling with orange indicator bar on left side
- [x] 2.6 Add hover state styling for non-active items

## 3. Integration

- [x] 3.1 Create navigation items configuration array with screen definitions
- [x] 3.2 Connect navigation to React Router for route-based active state detection
- [x] 3.3 Integrate sidebar into `App.tsx` layout for authenticated routes

## 4. Accessibility & RTL

- [x] 4.1 Add proper ARIA attributes (`aria-current`, `role="navigation"`)
- [x] 4.2 Ensure keyboard navigation support (tab order, focus states)
- [x] 4.3 Verify RTL layout with right-aligned text and left-side indicator

## 5. Testing

- [x] 5.1 Write unit tests for `RightSidebarTaskbar` component
- [x] 5.2 Write unit tests for `NavItem` sub-component
- [x] 5.3 Test active state detection with different routes