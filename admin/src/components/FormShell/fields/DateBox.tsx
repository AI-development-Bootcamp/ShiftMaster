import DatePicker, { registerLocale } from 'react-datepicker';
import { he } from 'date-fns/locale';
import { formatDate, parseLocalDate } from '@abra-shift-master/shared';
import { useMemo } from 'react';
import { DateBoxProps } from '../types';
import 'react-datepicker/dist/react-datepicker.css';

// Register Hebrew locale
registerLocale('he', he);

/**
 * DateBox component for single date selection.
 * Uses `react-datepicker` with Hebrew locale and specific styling.
 *
 * @param {DateBoxProps} props - Component props including label, value, and error state.
 * @returns {JSX.Element} The rendered date picker field.
 */
export function DateBox({
    id,
    label,
    placeholder,
    value,
    required,
    error,
    disabled,
    onChange,
}: DateBoxProps) {
    // Parse string date to Date object using shared utility
    const selectedDate = useMemo(() => parseLocalDate(value), [value]);

    const handleChange = (date: Date | null) => {
        if (date) {
            onChange(formatDate(date));
        } else {
            onChange('');
        }
    };

    return (
        <div className="form-field">
            <label htmlFor={id} className="form-field__label">
                {label}
                {required && <span className="form-field__required">*</span>}
            </label>
            <DatePicker
                id={id}
                selected={selectedDate}
                onChange={handleChange}
                locale="he"
                dateFormat="dd/MM/yyyy"
                placeholderText={placeholder || 'בחר תאריך'}
                className={`form-field__input form-field__datepicker ${error ? 'form-field__input--error' : ''}`}
                disabled={disabled}
                calendarStartDay={0}
                showPopperArrow={false}
            />
            {error && (
                <span id={`${id}-error`} className="form-field__error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
