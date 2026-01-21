import { TablePaginationConfig } from '../../TableShell/types';

/**
 * Context path showing the hierarchy: Client → Project → Task
 */
export interface ContextPath {
    client: { id: string; name: string };
    project: { id: string; name: string };
    task: { id: string; name: string };
}

/**
 * Employee row data for the assignment table
 */
export interface EmployeeRow {
    id: string;
    fullName: string;
    type: string;      // e.g., "עובד", "מנהל"
    role: string;      // e.g., "מפתח", "מעצב"
}

/**
 * Props for TaskEmployeeAssignmentForm component
 */
export interface TaskEmployeeAssignmentFormProps {
    // Required props
    contextPath: ContextPath;
    rows: EmployeeRow[];
    onSubmit: (selectedRows: EmployeeRow[]) => void | Promise<void>;
    onClose: () => void;

    // Optional props
    initialSelectedIds?: string[];
    isLoading?: boolean;
    error?: string | null;
    onSelectionChange?: (selectedRows: EmployeeRow[]) => void;
    searchEnabled?: boolean;
    pagination?: TablePaginationConfig & { onPageChange: (page: number) => void };
    onSearchChange?: (query: string) => void;
}
