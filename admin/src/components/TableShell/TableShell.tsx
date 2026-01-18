import { ReactNode } from 'react';
import { TableShellProps } from './types';
import { TableHeader } from './components/TableHeader';
import { TableBody } from './components/TableBody';
import { TableFooter } from './components/TableFooter';
import emptySpaceImg from '../../assets/empty_space.svg';
import './TableShell.css';

/**
 * TableShell
 * 
 * Generic RTL table component supporting:
 * - Server-side pagination and sorting
 * - Custom cell types (Text, Radio, Boolean, Actions, Tags)
 * - Empty and Loading states
 * - Fixed viewport-relative sizing
 */
export function TableShell<T>({
    className = '',
    columns,
    isLoading = false,
    emptyStateImageSrc = emptySpaceImg,
    pagination,
    sort,
    onSortChange,
    data,
    getRowId,
    rowActions,
    onRadioChange,
    onBoolChange,
    onPageChange
}: TableShellProps<T>): ReactNode {

    const isEmpty = !isLoading && pagination.totalItems === 0;
    const showFooter = pagination.totalPages > 1 && !isEmpty && !isLoading;

    return (
        <div className={`table-shell-container ${className} ${isEmpty ? 'table-shell-container--empty' : ''}`}>
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
                    />
                )}
            </table>

            {/* Empty State - Full body image */}
            {isEmpty && (
                <div className="table-shell__empty-container">
                    <img
                        src={emptyStateImageSrc}
                        alt="אין נתונים"
                        className="table-shell__empty-image"
                    />
                </div>
            )}

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
