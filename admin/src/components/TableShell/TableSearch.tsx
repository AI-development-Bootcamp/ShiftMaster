import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/TableSearch.css';

interface TableSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function TableSearch({
    value,
    onChange,
    placeholder,
    className = ''
}: TableSearchProps) {
    const { t } = useTranslation();
    const resolvedPlaceholder = placeholder || t('common.searchPlaceholder');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className={`table-search ${className}`}>
            <span className="table-search__icon">🔍</span>
            <input
                type="text"
                className="table-search__input"
                placeholder={resolvedPlaceholder}
                value={value}
                onChange={handleChange}
                aria-label={t('common.search')}
            />
        </div>
    );
}
