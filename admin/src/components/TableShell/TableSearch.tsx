import { ChangeEvent } from 'react';
import './TableSearch.css';

interface TableSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function TableSearch({
    value,
    onChange,
    placeholder = 'חיפוש...',
    className = ''
}: TableSearchProps) {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className={`table-search ${className}`}>
            <span className="table-search__icon">🔍</span>
            <input
                type="text"
                className="table-search__input"
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                aria-label="חיפוש"
            />
        </div>
    );
}
