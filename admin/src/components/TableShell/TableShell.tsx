import { ReactNode } from 'react';
import { TableShellProps } from './types';
import { TableHeader } from './components/TableHeader';
import { TableBody } from './components/TableBody';
import { TableFooter } from './components/TableFooter';
import emptySpaceImg from '../../assets/empty_space.svg';
import '../../styles/TableShell.css';

/**
 * TableShell
 * 
 * Generic RTL table component supporting:
 * - Server-side pagination and sorting
 * - Custom cell types (Text, Radio, Boolean, Actions, Tags, Selection)
 * - Multi-row selection with persistence across pagination
 * - Empty and Loading states
 * - Fixed viewport-relative sizing
 */
export function TableShell<T>({
    className = '',
    columns,
    isLoading = false,
    emptyStateImageSrc = emptySpaceImg,
    emptyStateAlt = '',
    pagination,
    sort,
    onSortChange,
    data,
    getRowId,
    rowActions,
    onRadioChange,
    onBoolChange,
    onPageChange,
    selectedRowKeys,
    onSelectionChange
}: TableShellProps<T>): ReactNode {

    const isEmpty = !isLoading && pagination.totalItems === 0;
    // Always show footer if there is data (even 1 page) to maintain fixed layout
    const showFooter = !isEmpty && !isLoading;

    return (
        <div className={`table-shell-container ${className} ${isEmpty ? 'table-shell-container--empty' : ''}`}>
            <div className="table-shell__content-wrapper">
                <table className="table-shell">
                    <TableHeader
                        columns={columns}
                        sort={sort}
                        onSortChange={onSortChange}
                    />

                    {/* Loading State - Skeleton Rows */}
                    {isLoading && (
                        <tbody className="table-shell__body">
                            {Array.from({ length: pagination.pageSize }).map((_, idx) => (
                                <tr key={`skeleton-${idx}`} className="table-shell__row">
                                    {columns.map((col) => (
                                        <td key={`skeleton-${idx}-${col.key}`} className="table-shell__cell">
                                            <div className="table-shell__skeleton" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    )}

                    {/* Normal State - Data Rows */}
                    {!isLoading && !isEmpty && (
                        <TableBody
                            data={data}
                            columns={columns}
                            getRowId={getRowId}
                            rowActions={rowActions}
                            onRadioChange={onRadioChange}
                            onBoolChange={onBoolChange}
                            selectedRowKeys={selectedRowKeys}
                            onSelectionChange={onSelectionChange}
                        />
                    )}
                </table>

                {/* Empty State - Full body image */}
                {isEmpty && (
                    <div className="table-shell__empty-container">
                        <img
                            src={emptyStateImageSrc}
                            alt={emptyStateAlt}
                            className="table-shell__empty-image"
                        />
                    </div>
                )}
            </div>

            {/* Footer - Pagination */}
            {showFooter && (
                <TableFooter
                    pagination={pagination}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
}
