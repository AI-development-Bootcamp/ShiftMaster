# TableShell Usage Guide

## Overview

TableShell is a generic, RTL table component for Admin UI that displays paginated data with:
- Server-side pagination and sorting
- Fixed viewport-relative sizing (80.185vh height)
- Multiple cell types (text, radio, boolean, actions, tags)
- Empty and loading states

## Basic Usage

```tsx
import { useState, useMemo } from 'react';
import { TableShell } from '../../components/TableShell';
import { TableColumnDef, SortState } from '../../components/TableShell/types';

interface MyData {
    id: number;
    name: string;
    status: string;
    active: boolean;
}

export function MyPage() {
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<SortState | null>([
        { key: 'name', direction: 'asc' }
    ]);

    const columns: TableColumnDef<MyData>[] = [
        {
            key: 'name',
            header: 'שם',
            type: 'text',
            sortable: true,
            width: '40%',
        },
        {
            key: 'status',
            header: 'סטטוס',
            type: 'radio',
            width: '40%',
            radioOptions: [
                { value: 'active', label: 'פעיל' },
                { value: 'inactive', label: 'לא פעיל' }
            ]
        },
        {
            key: 'active',
            header: 'פעיל',
            type: 'boolean',
            width: '20%',
        }
    ];

    // Process data (sorting, pagination)
    const { data, totalItems, totalPages } = useMemo(() => {
        // Your data processing logic here
        return { data: [], totalItems: 0, totalPages: 0 };
    }, [page, sort]);

    return (
        <TableShell
            tableId="my-table"
            data={data}
            columns={columns}
            getRowId={(row) => String(row.id)}
            pagination={{
                page,
                pageSize: 10,
                totalItems,
                totalPages
            }}
            onPageChange={setPage}
            sort={sort}
            onSortChange={setSort}
            onRadioChange={({ row, columnKey, nextValue }) => {
                console.log('Radio changed:', row.id, columnKey, nextValue);
            }}
            onBoolChange={({ row, columnKey, nextValue }) => {
                console.log('Bool changed:', row.id, columnKey, nextValue);
            }}
            isLoading={false}
        />
    );
}
```

## Column Types

### Text Column
```tsx
{
    key: 'name',
    header: 'שם',
    type: 'text',
    sortable: true,
    accessor: (row) => row.name, // Optional custom accessor
}
```

### Radio Column
```tsx
{
    key: 'status',
    header: 'סטטוס',
    type: 'radio',
    radioOptions: [
        { value: 'option1', label: 'אפשרות 1' },
        { value: 'option2', label: 'אפשרות 2' }
    ]
}
```

### Boolean Column
```tsx
{
    key: 'active',
    header: 'פעיל',
    type: 'boolean',
}
```

### Actions Column
```tsx
{
    key: 'actions',
    header: 'פעולות',
    type: 'actions',
}

// With rowActions prop:
rowActions={{
    showEdit: true,
    showDelete: true,
    onEdit: (row) => console.log('Edit:', row),
    onDelete: (row) => console.log('Delete:', row),
}}
```

### Tags Column
```tsx
{
    key: 'assignees',
    header: 'משויכים',
    type: 'tags',
    accessor: (row) => row.assignees, // Returns PersonChip[]
}
```

## Props Reference

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| tableId | string | Yes | Unique identifier for the table |
| data | T[] | Yes | Array of data items |
| columns | TableColumnDef<T>[] | Yes | Column definitions |
| getRowId | (row: T) => string | Yes | Function to get unique row ID |
| pagination | TablePaginationConfig | Yes | Pagination state |
| onPageChange | (page: number) => void | Yes | Page change handler |
| sort | SortState \| null | Yes | Current sort state |
| onSortChange | (sort: SortState \| null) => void | Yes | Sort change handler |
| isLoading | boolean | No | Show loading skeleton |
| emptyStateImageSrc | string | No | Custom empty state image |
| rowActions | RowActionsConfig<T> | No | Action button config |
| onRadioChange | function | No | Radio value change handler |
| onBoolChange | function | No | Boolean value change handler |

## States

### Loading State
Set `isLoading={true}` to show skeleton rows.

### Empty State
When `pagination.totalItems === 0` and `isLoading === false`, the empty state image fills the body area.

### Normal State
Data rows are displayed with the configured column types.

## Sorting

TableShell supports multi-column sorting via `SortState`:

```tsx
type SortState = Array<{
    key: string;
    direction: 'asc' | 'desc';
}>;
```

Use `disableSortClearing: true` on a column to prevent removing sort (only toggles asc/desc).
