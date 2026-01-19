import { SortState, TableColumnDef } from '../types';

interface TableHeaderProps<T> {
    columns: TableColumnDef<T>[];
    sort: SortState | null;
    onSortChange: (sort: SortState | null) => void;
}

/**
 * TableHeader
 * Renders the table head with column labels and sorting indicators.
 */
export function TableHeader<T>({ columns, sort, onSortChange }: TableHeaderProps<T>) {

    const handleHeaderClick = (column: TableColumnDef<T>) => {
        if (!column.sortable) return;

        const currentSort = sort ? [...sort] : [];
        const existingIndex = currentSort.findIndex(s => s.key === column.key);
        const existingItem = existingIndex >= 0 ? currentSort[existingIndex] : null;

        let nextDirection: 'asc' | 'desc' | null = 'asc';

        if (existingItem) {
            if (existingItem.direction === 'asc') {
                nextDirection = 'desc';
            } else if (column.disableSortClearing) {
                nextDirection = 'asc';
            } else {
                nextDirection = null;
            }
        }

        const nextSort = [...currentSort];

        if (nextDirection) {
            if (existingIndex >= 0) {
                nextSort[existingIndex] = { key: column.key, direction: nextDirection };
            } else {
                nextSort.push({ key: column.key, direction: nextDirection });
            }
        } else {
            if (existingIndex >= 0) {
                nextSort.splice(existingIndex, 1);
            }
        }

        onSortChange(nextSort.length > 0 ? nextSort : null);
    };

    return (
        <thead className="table-shell__header">
            <tr>
                {columns.map((col) => {
                    const sortItem = sort?.find(s => s.key === col.key);
                    const isSorted = !!sortItem;
                    const sortDirection = sortItem?.direction;

                    return (
                        <th
                            key={col.key}
                            className={`table-shell__header-cell ${col.sortable ? 'table-shell__header-cell--sortable' : ''}`}
                            style={{
                                width: col.width,
                                minWidth: col.minWidth,
                                textAlign: col.align || 'right',
                            }}
                            onClick={() => handleHeaderClick(col)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    if (e.key === ' ') e.preventDefault();
                                    handleHeaderClick(col);
                                }
                            }}
                            role={col.sortable ? 'button' : undefined}
                            tabIndex={col.sortable ? 0 : undefined}
                            aria-sort={isSorted ? (sortDirection === 'asc' ? 'ascending' : 'descending') : (col.sortable ? 'none' : undefined)}
                        >
                            {isSorted && (
                                <span className="table-shell__sort-indicator">
                                    {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                            {col.header}
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
}
