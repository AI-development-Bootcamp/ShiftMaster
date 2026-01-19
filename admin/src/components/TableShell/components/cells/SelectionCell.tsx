import { ChangeEvent } from 'react';

interface SelectionCellProps {
    rowId: string;
    isSelected: boolean;
    onChange: (rowId: string, checked: boolean) => void;
    ariaLabel?: string;
}

/**
 * SelectionCell
 * Renders a checkbox for row selection in TableShell.
 * Selection state is controlled externally via isSelected prop.
 */
export function SelectionCell({
    rowId,
    isSelected,
    onChange,
    ariaLabel = 'בחר שורה'
}: SelectionCellProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(rowId, e.target.checked);
    };

    return (
        <div className="table-shell__selection-cell">
            <input
                type="checkbox"
                checked={isSelected}
                onChange={handleChange}
                aria-label={ariaLabel}
                className="table-shell__selection-checkbox"
            />
        </div>
    );
}
