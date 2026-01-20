import { TableRowId } from '../../types';

interface RadioCellProps<T> {
    row: T;
    rowId: TableRowId;
    columnKey: string;
    value: string;
    options?: Array<{ value: string; label: string }>;
    onChange?: (args: { row: T; columnKey: string; nextValue: string }) => void;
}

export function RadioCell<T>({
    row,
    rowId,
    columnKey,
    value,
    options = [],
    onChange
}: RadioCellProps<T>) {

    const handleChange = (nextValue: string) => {
        if (onChange) {
            onChange({ row, columnKey, nextValue });
        }
    };

    return (
        <div className="table-shell__radio-group">
            {options.map((opt) => (
                <label key={opt.value} className="table-shell__radio-label">
                    <input
                        type="radio"
                        className="table-shell__radio-input"
                        name={`radio-${rowId}-${columnKey}`}
                        value={opt.value}
                        checked={value === opt.value}
                        onChange={() => handleChange(opt.value)}
                    />
                    {opt.label}
                </label>
            ))}
        </div>
    );
}

