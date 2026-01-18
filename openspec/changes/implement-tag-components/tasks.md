# Tasks

1.  [x] Define CSS Design Tokens in global CSS (`admin/src/styles/variables.css` or equivalent) <!-- id: 1 -->
    -   Add colors, typography, radii, sizing, and spacing variables as specified.
2.  [x] Implement `Tag` component in `admin/src/components/ui/Tag.tsx` (or similar path) <!-- id: 2 -->
    -   Support `name` prop.
    -   Implement styling using the defined CSS variables.
    -   Ensure RTL and truncation support.
3.  [x] Implement `MultiTags` component in `admin/src/components/ui/MultiTags.tsx` <!-- id: 3 -->
    -   Support `people` and `disabled` props.
    -   Implement counter logic (N+).
    -   Implement Tooltip logic (show on hover).
    -   Ensure correct styling and RTL support.
4.  [x] Manual Verification <!-- id: 4 -->
    -   Create a temporary test page or use an existing one to render `Tag` with long/short names.
    -   Render `MultiTags` with 0, 1, 5 users and check tooltip behavior.
    -   Check `disabled` state behavior.
