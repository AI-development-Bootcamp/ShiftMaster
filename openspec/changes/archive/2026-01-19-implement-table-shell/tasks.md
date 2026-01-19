# Tasks: Implement TableShell

## 1. Foundation

- [x] 1.1 Create TableShell directory structure
- [x] 1.2 Define TypeScript interfaces (`types.ts`)
- [x] 1.3 Create main TableShell.tsx container
- [x] 1.4 Create TableShell.css with viewport-relative sizing
- [x] 1.5 Create index.ts with public exports

## 2. Header Component

- [x] 2.1 Create TableHeader.tsx
- [x] 2.2 Implement column rendering with RTL alignment
- [x] 2.3 Add sort indicators (↑/↓)
- [x] 2.4 Implement sort click handler (array-based SortState)
- [x] 2.5 Apply header styling (fixed height: 0.75 × RowHeight)

## 3. Body Component

- [x] 3.1 Create TableBody.tsx
- [x] 3.2 Implement row rendering with dynamic cell types
- [x] 3.3 Create TextCell.tsx (single-line, ellipsis)
- [x] 3.4 Create RadioCell.tsx (inline enum selection)
- [x] 3.5 Create ActionsCell.tsx (edit/delete/add buttons)
- [x] 3.6 Create TagsCell.tsx (with N+ overflow indicator)
- [x] 3.7 Create BoolCell.tsx (checkbox)

## 4. Footer Component

- [x] 4.1 Create TableFooter.tsx
- [x] 4.2 Implement pagination controls (prev/next, page numbers)
- [x] 4.3 Apply footer styling (height: 1 × RowHeight)
- [x] 4.4 Implement visibility rule (hide if totalPages <= 1)
- [x] 4.5 Body expansion when footer hidden

## 5. State Handling

- [x] 5.1 Implement Loading state (skeleton rows)
- [x] 5.2 Implement Empty state (empty_space.svg covering body)
- [x] 5.3 Ensure no layout shifts between states
- [x] 5.4 Verify fixed table height across all states

## 6. Layout & Positioning

- [x] 6.1 Apply viewport-relative table height (866:1080)
- [x] 6.2 Align Header top with Sidebar first nav item
- [x] 6.3 Apply uniform padding
- [x] 6.4 Center table horizontally in content area
- [x] 6.5 Verify column width distribution (equal split)

## 7. Integration & Documentation

- [x] 7.1 Create USAGE.md with implementation examples
- [x] 7.2 Integrate with EntriesManagementPage
- [x] 7.3 Verify RTL alignment throughout
- [x] 7.4 Test with mock data

## 8. Validation

- [x] 8.1 Verify all acceptance criteria from spec
- [x] 8.2 Test Empty → Data transition (no layout jump)
- [x] 8.3 Test Data → Empty transition (no layout jump)
- [x] 8.4 Verify pagination behavior
- [x] 8.5 Verify sort indicator behavior
