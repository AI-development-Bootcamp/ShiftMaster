import { TableRowId } from '../../types';

interface BoolCellProps<T> {
    row: T;
    rowId: TableRowId;
    columnKey: string;
    value: boolean;
    onChange?: (args: { row: T; columnKey: string; nextValue: boolean }) => void;
}

export function BoolCell<T>({
    row,
    columnKey,
    value,
    onChange
}: BoolCellProps<T>) {

    const handleChange = () => {
        if (onChange) {
            onChange({ row, columnKey, nextValue: !value });
        }
    };

    return (
        <input
            type="checkbox"
            className="table-shell__checkbox"
            checked={value}
            onChange={handleChange}
        />
    );
}
