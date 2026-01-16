import DatePicker, { registerLocale } from 'react-datepicker';
import { he } from 'date-fns/locale';
import { DateBoxProps } from '../types';
import 'react-datepicker/dist/react-datepicker.css';

// Register Hebrew locale
registerLocale('he', he);

/**
 * DateBox - Single date picker with Hebrew calendar
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
    // Parse string date to Date object
    const selectedDate = value ? new Date(value) : null;

    const handleChange = (date: Date | null) => {
        if (date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            onChange(`${year}-${month}-${day}`);
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
