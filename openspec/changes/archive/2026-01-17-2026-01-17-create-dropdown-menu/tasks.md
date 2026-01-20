1. **Scaffold Component Structure** <!-- id: 0 -->
   - [x] Create the directory `admin/src/components/CreateDropdownMenu`.
   - [x] Ensure clear separation of concerns (types, styles, component).

2. **Define UI Constants** <!-- id: 10 -->
   - [x] Update `admin/src/constants/ui.ts`.
   - [x] Add `DROPDOWN_PLACEMENT` object with keys `BOTTOM_START`, `BOTTOM_END`, and `BOTTOM`.

3. **Define Component Types** <!-- id: 2 -->
   - [x] Create `admin/src/components/CreateDropdownMenu/types.ts`.
   - [x] Export `CreateMenuOption` interface with `id`, `label`, `disabled` (optional), and `onSelect`.
   - [x] Export `CreateDropdownMenuProps` interface including `options` and placement configuration.

4. **Implement Styling** <!-- id: 3 -->
   - [x] Create `admin/src/components/CreateDropdownMenu/CreateDropdownMenu.css`.
   - [x] Define styles for `.create-menu__trigger`, `.create-menu__dropdown`, and `.create-menu__item`.
   - [x] Include states for hover and focus.

5. **Implement Visual Component Logic** <!-- id: 1 -->
   - [x] Create `admin/src/components/CreateDropdownMenu/CreateDropdownMenu.tsx`.
   - [x] Implement the "Create" button trigger.
   - [x] Use `useState` to manage the dropdown's open/closed state.
   - [x] Render the options list conditionally based on state.

6. **Implement Logic & Events** <!-- id: 6 -->
   - [x] Add event listener for clicking outside the component to close it (use `useRef`).
   - [x] Add `keydown` listener for the `Escape` key to close the menu.

7. **Implement Accessibility** <!-- id: 5 -->
   - [x] Add `aria-haspopup` and `aria-expanded` to the button.
   - [x] Add `role="menu"` to the dropdown container.
   - [x] Add `role="menuitem"` to each option.

8. **Export Public API** <!-- id: 4 -->
   - [x] Create `admin/src/components/CreateDropdownMenu/index.ts`.
   - [x] Re-export the component and relevant types.

9. **Manual Verification** <!-- id: 7 -->
   - [x] **Mandatory**: Import the component into `AssignmentPage.tsx`.
   - [x] Create a dummy options list and inspect the UI behavior, styling, and interactions manually.

10. **Unit Testing: Rendering** <!-- id: 8 -->
    - [x] **Mandatory**: Create `admin/src/components/CreateDropdownMenu/CreateDropdownMenu.test.tsx`.
    - [x] Write a test to ensure the button renders with the correct label.
    - [x] Write a test to ensure the dropdown is hidden by default.

11. **Unit Testing: Interactions** <!-- id: 9 -->
    - [x] **Mandatory**: Write tests for clicking the button to open/toggle the menu.
    - [x] Write tests to verify clicking an option calls `onSelect` and closes the menu.
    - [x] Write tests to verify `disabled` options do not trigger `onSelect`.


