import { TableColumnDef, TableRowId, RowActionsConfig } from '../types';
import { TextCell } from './cells/TextCell';
import { RadioCell } from './cells/RadioCell';
import { BoolCell } from './cells/BoolCell';
import { ActionsCell } from './cells/ActionsCell';
import { TagsCell } from './cells/TagsCell';
import { SelectionCell } from './cells/SelectionCell';

interface TableBodyProps<T> {
    data: T[];
    columns: TableColumnDef<T>[];
    getRowId: (row: T) => TableRowId;
    rowActions?: RowActionsConfig<T>;
    onRadioChange?: (args: { row: T; columnKey: string; nextValue: string }) => void;
    onBoolChange?: (args: { row: T; columnKey: string; nextValue: boolean }) => void;
    // Selection props
    selectedRowKeys?: Set<string>;
    onSelectionChange?: (keys: Set<string>) => void;
}

export function TableBody<T>({
    data,
    columns,
    getRowId,
    rowActions,
    onRadioChange,
    onBoolChange,
    selectedRowKeys,
    onSelectionChange
}: TableBodyProps<T>) {

    const handleSelectionToggle = (rowId: string, checked: boolean) => {
        if (!onSelectionChange) return;

        const newKeys = new Set(selectedRowKeys ?? []);
        if (checked) {
            newKeys.add(rowId);
        } else {
            newKeys.delete(rowId);
        }
        onSelectionChange(newKeys);
    };

    return (
        <tbody className="table-shell__body">
            {data.map((row) => {
                const rowId = getRowId(row);
                const isSelected = selectedRowKeys?.has(rowId) ?? false;

                return (
                    <tr key={rowId} className={`table-shell__row ${isSelected ? 'table-shell__row--selected' : ''}`}>
                        {columns.map((col) => {
                            const cellKey = `${rowId}-${col.key}`;

                            const renderCellContent = () => {
                                // Selection column
                                if (col.type === 'selection') {
                                    return (
                                        <SelectionCell
                                            rowId={rowId}
                                            isSelected={isSelected}
                                            onChange={handleSelectionToggle}
                                            ariaLabel={`בחר שורה ${rowId}`}
                                        />
                                    );
                                }

                                // Custom render override
                                if (col.renderCell) {
                                    return col.renderCell({ row, rowId });
                                }

                                // Access value
                                const value = col.accessor
                                    ? col.accessor(row)
                                    : (row as Record<string, unknown>)[col.key];

                                // Switch by column type
                                switch (col.type) {
                                    case 'radio':
                                        return (
                                            <RadioCell
                                                row={row}
                                                rowId={rowId}
                                                columnKey={col.key}
                                                value={value as string}
                                                options={col.radioOptions}
                                                onChange={onRadioChange}
                                            />
                                        );

                                    case 'boolean':
                                        return (
                                            <BoolCell
                                                row={row}
                                                columnKey={col.key}
                                                value={value as boolean}
                                                onChange={onBoolChange}
                                            />
                                        );

                                    case 'actions':
                                        if (!rowActions) return null;
                                        return <ActionsCell row={row} config={rowActions} />;

                                    case 'tags':
                                        return <TagsCell tags={value as Array<{ id: string; name: string }> || []} />;

                                    case 'text':
                                    default:
                                        return <TextCell value={value} />;
                                }
                            };

                            return (
                                <td
                                    key={cellKey}
                                    className={`table-shell__cell ${col.type === 'actions' ? 'table-shell__cell--actions' : ''} ${col.type === 'tags' ? 'table-shell__cell--tags' : ''} ${col.type === 'selection' ? 'table-shell__cell--selection' : ''}`}
                                    style={{ textAlign: col.type === 'selection' ? 'center' : (col.align || 'right') }}
                                >
                                    {renderCellContent()}
                                </td>
                            );
                        })}
                    </tr>
                );
            })}
        </tbody>
    );
}

