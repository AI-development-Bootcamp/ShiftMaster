# Tasks: Add Task Employee Assignment Form

## Phase 1: TableShell Selection Extension

- [x] **1.1** Add `'selection'` to `TableColumnType` in `types.ts`
- [x] **1.2** Add `selectedRowKeys` and `onSelectionChange` props to `TableShellProps`
- [x] **1.3** Create `SelectionCell` component with checkbox rendering
- [x] **1.4** Update `TableHeader` to render empty cell for selection column
- [x] **1.5** Update `TableBody` to render `SelectionCell` for selection type
- [x] **1.6** Update `TableShell` to pass selection state to body
- [ ] **1.7** Write unit tests for selection functionality

## Phase 2: TaskEmployeeAssignmentForm Component

- [x] **2.1** Create types file with `ContextPath`, `EmployeeRow`, and props interfaces
- [x] **2.2** Create base component with header (title + context pills)
- [x] **2.3** Add search input with debounce filtering
- [x] **2.4** Integrate TableShell with selection column
- [x] **2.5** Add footer with submit button (disabled/loading states)
- [x] **2.6** Implement selection change handler with parent callback
- [x] **2.7** Add submit flow with async support
- [x] **2.8** Create CSS styles (RTL, pills, layout)
- [x] **2.9** Add error state display (inline alert above table)
- [ ] **2.10** Write unit tests for form behavior

## Phase 3: Integration & Validation

- [x] **3.1** Add mock data for employees (if not exists)
- [ ] **3.2** Create demo/usage example in storybook or test page
- [x] **3.3** Verify RTL layout and accessibility
- [x] **3.4** Run full test suite and fix any regressions

---

## Dependencies

- Phase 2 depends on Phase 1 completion
- Phase 3 can start partially after 2.4

## Parallelizable

- 1.1-1.2 can run in parallel
- 2.1, 2.8 can run in parallel with 2.2
- 2.9, 2.10 can run in parallel after 2.7

