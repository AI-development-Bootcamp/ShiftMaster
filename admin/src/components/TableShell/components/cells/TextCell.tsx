interface TextCellProps {
    value: unknown;
}

export function TextCell({ value }: TextCellProps) {
    const displayValue = value != null ? String(value) : '';

    return <span title={displayValue}>{displayValue}</span>;
}
