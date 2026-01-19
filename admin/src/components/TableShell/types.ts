import { ReactNode } from 'react';

// --- Sort Types ---
export type SortDirection = 'asc' | 'desc';

export interface SortItem {
    key: string;
    direction: SortDirection;
}

export type SortState = SortItem[];

// --- Column Types ---
export type TableRowId = string;
export type TableColumnType = 'text' | 'radio' | 'boolean' | 'tags' | 'actions';

export interface TableColumnDef<T> {
    key: string;
    header: string;
    type: TableColumnType;

    // Layout
    width?: number | string;
    minWidth?: number | string;
    align?: 'right' | 'center' | 'left'; // RTL default is 'right'

    // Data Access
    accessor?: (row: T) => unknown;

    // Sorting
    sortable?: boolean;
    disableSortClearing?: boolean;

    // Custom Rendering
    renderCell?: (ctx: { row: T; rowId: TableRowId }) => ReactNode;

    // Specific config for cells
    radioOptions?: Array<{ value: string; label: string }>;
}

// --- Action Types ---
// --- Action Types ---
export interface ActionOption<T> {
    label: string;
    onClick: (row: T) => void;
    variant?: 'danger' | 'default';
}

export interface RowActionsConfig<T> {
    showEdit?: boolean;
    showDelete?: boolean;
    showAdd?: boolean;

    onEdit?: (row: T) => void;
    editOptions?: ActionOption<T>[];

    onDelete?: (row: T) => void;
    deleteOptions?: ActionOption<T>[];

    onAdd?: (row: T) => void;
    addOptions?: ActionOption<T>[];
}

// --- Pagination Types ---
export interface TablePaginationConfig {
    page: number;      // 1-based
    pageSize: number;
    totalItems: number;
    totalPages: number;
}

// --- Main Props ---
export interface TableShellProps<T> {
    tableId: string;
    className?: string;

    // Data & Definitions
    columns: TableColumnDef<T>[];
    data: T[];
    getRowId: (row: T) => TableRowId;

    // State
    isLoading?: boolean;
    emptyStateImageSrc?: string;
    emptyStateAlt?: string;

    // Pagination
    pagination: TablePaginationConfig;
    onPageChange: (nextPage: number) => void;

    // Sorting
    sort: SortState | null;
    onSortChange: (nextSort: SortState | null) => void;

    // Actions
    rowActions?: RowActionsConfig<T>;
    onRadioChange?: (args: {
        row: T;
        columnKey: string;
        nextValue: string;
    }) => Promise<void> | void;
    onBoolChange?: (args: {
        row: T;
        columnKey: string;
        nextValue: boolean;
    }) => Promise<void> | void;
}

// --- Sub-types for Cells ---
export interface PersonChip {
    id: string;
    name: string;
}
