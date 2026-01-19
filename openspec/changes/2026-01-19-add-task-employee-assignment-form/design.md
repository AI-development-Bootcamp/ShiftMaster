# Design: Task Employee Assignment Form

## Overview

This design covers two related changes:
1. **TableShell Selection Extension**: Adding multi-select row capability
2. **TaskEmployeeAssignmentForm**: A form component using TableShell for employee assignment

---

## Part 1: TableShell Selection Extension

### Current State

TableShell supports column types: `text`, `radio`, `boolean`, `tags`, `actions`.
No row selection capability exists.

### Proposed Architecture

```
TableShellProps<T>
├── ...existing props...
├── selectedRowKeys?: Set<string>           // NEW
├── onSelectionChange?: (keys: Set<string>) => void  // NEW
└── columns: TableColumnDef<T>[]
    └── type: 'text' | 'radio' | 'boolean' | 'tags' | 'actions' | 'selection'  // EXTENDED
```

### Selection Column Type

```typescript
// In types.ts
export type TableColumnType = 'text' | 'radio' | 'boolean' | 'tags' | 'actions' | 'selection';

// Selection column definition
{
  type: 'selection',
  key: 'selection',    // Reserved key
  header: '',          // Must be empty string
}
```

### SelectionCell Component

New file: `components/cells/SelectionCell.tsx`

```typescript
interface SelectionCellProps {
  rowId: string;
  isSelected: boolean;
  onChange: (rowId: string, checked: boolean) => void;
  ariaLabel?: string;
}
```

### State Flow

```
Parent Component
    │
    ├── selectedRowKeys: Set<string>
    │
    └── onSelectionChange(keys)
            │
            ▼
        TableShell
            │
            └── SelectionCell
                  │
                  └── checkbox onChange
                        │
                        ▼
                    Parent updates selectedRowKeys
```

### RTL Considerations

- Selection column renders first in RTL (rightmost visually)
- No special RTL handling needed for checkbox itself

---

## Part 2: TaskEmployeeAssignmentForm

### Component Structure

```
TaskEmployeeAssignmentForm
├── Header
│   ├── Title: "שייך עובד חדש למשימה"
│   ├── Subtitle: "כאן תוכל לשייך עובד חדש מהמאגר לטובת"
│   └── ContextPills: [Client] → [Project] → [Task]
│
├── Content
│   ├── SearchInput (debounced 300ms)
│   └── TableShell (with selection column)
│
└── Footer
    └── PrimaryButton: "שייך עובד למשימה"
```

### Props Interface

```typescript
interface TaskEmployeeAssignmentFormProps {
  // Required
  contextPath: ContextPath;
  rows: EmployeeRow[];
  onSubmit: (selectedRows: EmployeeRow[]) => void | Promise<void>;
  
  // Optional
  initialSelectedIds?: string[];
  isLoading?: boolean;
  error?: string | null;
  onSelectionChange?: (selectedRows: EmployeeRow[]) => void;
  searchEnabled?: boolean;
  pagination?: TablePaginationConfig & { onPageChange: (page: number) => void };
  onSearchChange?: (query: string) => void;
}
```

### State Management

```typescript
// Internal state
const [selectedIds, setSelectedIds] = useState<Set<string>>(
  new Set(initialSelectedIds ?? [])
);
const [searchQuery, setSearchQuery] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);

// Derived
const filteredRows = useMemo(() => 
  rows.filter(r => normalize(r.fullName).includes(normalize(searchQuery))),
  [rows, searchQuery]
);
```

### Columns Configuration

```typescript
const columns: TableColumnDef<EmployeeRow>[] = [
  { type: 'selection', key: 'selection', header: '' },
  { key: 'fullName', header: 'שם מלא', type: 'text', align: 'right' },
  { key: 'type', header: 'סוג', type: 'text', align: 'right' },
  { key: 'role', header: 'תפקיד', type: 'text', align: 'right' },
];
```

---

## File Structure

```
admin/src/components/
├── TableShell/
│   ├── types.ts                    # MODIFIED: Add 'selection' type
│   ├── TableShell.tsx              # MODIFIED: Add selection props
│   └── components/
│       ├── TableBody.tsx           # MODIFIED: Handle selection column
│       ├── TableHeader.tsx         # MODIFIED: Render empty header for selection
│       └── cells/
│           └── SelectionCell.tsx   # NEW
│
└── task/
    └── TaskEmployeeAssignmentForm/
        ├── index.ts                # NEW
        ├── TaskEmployeeAssignmentForm.tsx      # NEW
        ├── TaskEmployeeAssignmentForm.types.ts # NEW
        ├── TaskEmployeeAssignmentForm.css      # NEW
        └── TaskEmployeeAssignmentForm.test.tsx # NEW
```

---

## Trade-offs

| Decision | Rationale |
|----------|-----------|
| No "select all" in header | Spec requires empty header; can add later if needed |
| Selection via checkbox only | Simpler implementation; row click toggle adds complexity |
| IDs-only in state | Prevents stale object references; mapping done at submit time |
| Client-side search first | MVP approach; server-side via optional `onSearchChange` |
