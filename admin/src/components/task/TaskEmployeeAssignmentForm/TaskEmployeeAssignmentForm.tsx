import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { TaskEmployeeAssignmentFormProps, EmployeeRow } from './TaskEmployeeAssignmentForm.types';
import { TableShell, SortState } from '../../TableShell';
import { TableSearch } from '../../TableShell/TableSearch';
import { useTableSearch } from '../../../hooks/useTableSearch';
import '../../../styles/TaskEmployeeAssignmentForm.css';

const DEFAULT_PAGE_SIZE = 8;

/**
 * TaskEmployeeAssignmentForm
 *
 * Modal form for assigning employees to a task.
 * Uses TableShell with multi-select selection column.
 * Refactored to use reusable TableSearch component.
 */
export function TaskEmployeeAssignmentForm({
    contextPath,
    rows,
    onSubmit,
    onClose,
    initialSelectedIds = []
}: TaskEmployeeAssignmentFormProps) {
    const { t, i18n } = useTranslation();
    // --- State ---
    const [localPage, setLocalPage] = useState(1);
    const [sort, setSort] = useState<SortState | null>(null);
    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(initialSelectedIds));
    const [error, setError] = useState<string | null>(null);
    const [dynamicPageSize, setDynamicPageSize] = useState(DEFAULT_PAGE_SIZE);
    const tableWrapperRef = useRef<HTMLDivElement>(null);

    // Sync selectedKeys with initialSelectedIds prop
    useEffect(() => {
        setSelectedKeys(new Set(initialSelectedIds));
        setError(null);
    }, [initialSelectedIds]);

    // --- Dynamic Page Size Logic ---
    useEffect(() => {
        const calculatePageSize = () => {
            if (!tableWrapperRef.current) return;
            const containerHeight = tableWrapperRef.current.clientHeight;
            const rowHeight = 48; // Conservative estimate
            const calculated = Math.floor(containerHeight / rowHeight);
            const newSize = Math.max(1, calculated);

            setDynamicPageSize(prev => prev !== newSize ? newSize : prev);
        };

        calculatePageSize();
        const observer = new ResizeObserver(calculatePageSize);
        if (tableWrapperRef.current) {
            observer.observe(tableWrapperRef.current);
        }
        return () => observer.disconnect();
    }, []);

    // --- Search Logic (Reusable) ---
    const { searchQuery, setSearchQuery, filteredData } = useTableSearch(rows, ['fullName']);

    // Reset page on search
    useEffect(() => {
        setLocalPage(1);
    }, [searchQuery]);

    // --- Data Aggregation (Sort & Paginate Filtered Data) ---
    const { data, totalItems, totalPages } = useMemo(() => {
        const processedData = [...filteredData];

        // 1. Sort
        if (sort && sort.length > 0) {
            processedData.sort((a, b) => {
                for (const sortItem of sort) {
                    const key = sortItem.key as keyof EmployeeRow;
                    const valA = String(a[key] || '');
                    const valB = String(b[key] || '');

                    if (valA < valB) return sortItem.direction === 'asc' ? -1 : 1;
                    if (valA > valB) return sortItem.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        // 2. Paginate
        const totalItems = processedData.length;
        const totalPages = Math.ceil(totalItems / dynamicPageSize);
        const startIndex = (localPage - 1) * dynamicPageSize;
        const paginatedData = processedData.slice(startIndex, startIndex + dynamicPageSize);

        return { data: paginatedData, totalItems, totalPages };
    }, [filteredData, localPage, sort, dynamicPageSize]);

    // Clamp page when totalPages updates (e.g. on resize)
    useEffect(() => {
        if (totalPages > 0 && localPage > totalPages) {
            setLocalPage(totalPages);
        }
    }, [totalPages, localPage]);

    // --- Handlers ---
    const handleToggleSelection = (keys: Set<string>) => {
        setSelectedKeys(keys);
        setError(null);
    };

    const handleSubmit = async () => {
        if (selectedKeys.size === 0) {
            setError(t('taskEmployeeAssignmentForm.errors.selectAtLeastOne'));
            return;
        }
        setError(null);
        try {
            const selectedRows = rows.filter(r => selectedKeys.has(r.id));
            await onSubmit(selectedRows);
        } catch (error) {
            console.error({ code: 'TASK_EMP_ASSIGN_SUBMIT_FAIL', error });
            setError(t('taskEmployeeAssignmentForm.errors.submitFailed', { code: 'TASK_EMP_ASSIGN_SUBMIT_FAIL' }));
        }
    };

    // --- Keyboard Support ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="task-employee-form__overlay" onClick={onClose}>
            <div
                className="task-employee-form"
                dir={i18n.dir()}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                {/* Header */}
                <header className="task-employee-form__header">
                    <button
                        type="button"
                        className="task-employee-form__close-btn"
                        onClick={onClose}
                        aria-label={t('taskEmployeeAssignmentForm.close')}
                    >
                        ×
                    </button>

                    <div className="task-employee-form__header-top">
                        <h2 className="task-employee-form__title">
                            {t('taskEmployeeAssignmentForm.title')}
                        </h2>
                    </div>

                    <div className="task-employee-form__header-bottom">
                        <p className="task-employee-form__subtitle">
                            {t('taskEmployeeAssignmentForm.subtitle')}
                        </p>
                        <div className="task-employee-form__context-pills">
                            <span className="task-employee-form__pill">{contextPath.client.name}</span>
                            <span className="task-employee-form__pill-separator">←</span>
                            <span className="task-employee-form__pill">{contextPath.project.name}</span>
                            <span className="task-employee-form__pill-separator">←</span>
                            <span className="task-employee-form__pill">{contextPath.task.name}</span>
                        </div>
                    </div>

                    <div className="task-employee-form__header-search">
                        <TableSearch
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder={t('taskEmployeeAssignmentForm.searchPlaceholder')}
                            className="task-employee-form__search-overrides"
                        />
                    </div>
                </header>

                {/* Content */}
                <div className="task-employee-form__content">
                    {error && (
                        <div className="task-employee-form__error" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="task-employee-form__table-wrapper" ref={tableWrapperRef}>
                        <TableShell
                            tableId="task-employee-assignment-table"
                            data={data}
                            columns={[
                                { key: 'selection', header: '', type: 'selection', width: 48 },
                                { key: 'fullName', header: t('taskEmployeeAssignmentForm.columns.employeeName'), type: 'text', sortable: true, width: '40%' },
                                { key: 'type', header: t('taskEmployeeAssignmentForm.columns.employeeType'), type: 'text', sortable: true, width: '30%' },
                                { key: 'role', header: t('taskEmployeeAssignmentForm.columns.role'), type: 'text', sortable: true, width: '30%' },
                            ]}
                            getRowId={(row) => row.id}
                            pagination={{
                                page: localPage,
                                pageSize: dynamicPageSize,
                                totalItems,
                                totalPages
                            }}
                            onPageChange={setLocalPage}
                            sort={sort}
                            onSortChange={setSort}
                            selectedRowKeys={selectedKeys}
                            onSelectionChange={handleToggleSelection}
                            isLoading={false}
                            emptyStateAlt={t('taskEmployeeAssignmentForm.emptyState')}
                        />
                    </div>
                </div>

                {/* Footer */}
                <footer className="task-employee-form__footer">
                    <button
                        type="button"
                        className="task-employee-form__submit-btn"
                        onClick={handleSubmit}
                        disabled={selectedKeys.size === 0}
                    >
                        {t('taskEmployeeAssignmentForm.submitButton')}
                    </button>
                </footer>
            </div>
        </div>
    );
}
