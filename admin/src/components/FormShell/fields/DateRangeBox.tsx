import { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { he } from 'date-fns/locale';
import { DateRangeBoxProps } from '../types';
import 'react-datepicker/dist/react-datepicker.css';

// Register Hebrew locale
registerLocale('he', he);

/**
 * DateRangeBox - Start and end date picker with cross-field validation
 */
export function DateRangeBox({
    id,
    label,
    value,
    required,
    error,
    disabled,
    onChange,
}: DateRangeBoxProps) {
    const [internalError, setInternalError] = useState<string | undefined>();

    // Parse string dates to Date objects
    const startDate = value.start ? new Date(value.start) : null;
    const endDate = value.end ? new Date(value.end) : null;

    // Cross-field validation
    useEffect(() => {
        if (startDate && endDate && endDate < startDate) {
            setInternalError('תאריך הסיום חייב להיות אחרי תאריך ההתחלה');
        } else {
            setInternalError(undefined);
        }
    }, [value.start, value.end]);

    const handleStartChange = (date: Date | null) => {
        const formatted = date ? date.toISOString().split('T')[0] : '';
        onChange({ ...value, start: formatted });
    };

    const handleEndChange = (date: Date | null) => {
        const formatted = date ? date.toISOString().split('T')[0] : '';
        onChange({ ...value, end: formatted });
    };

    const displayError = error || internalError;

    return (
        <div className="form-field form-field--date-range">
            <label className="form-field__label">
                {label}
                {required && <span className="form-field__required">*</span>}
            </label>
            <div className="form-field__date-range-inputs">
                <div className="form-field__date-range-item">
                    <span className="form-field__date-range-label">מתאריך</span>
                    <DatePicker
                        id={`${id}-start`}
                        selected={startDate}
                        onChange={handleStartChange}
                        locale="he"
                        dateFormat="dd/MM/yyyy"
                        placeholderText="בחר תאריך התחלה"
                        className={`form-field__input form-field__datepicker ${displayError ? 'form-field__input--error' : ''}`}
                        disabled={disabled}
                        calendarStartDay={0}
                        showPopperArrow={false}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                    />
                </div>
                <span className="form-field__date-range-separator">—</span>
                <div className="form-field__date-range-item">
                    <span className="form-field__date-range-label">עד תאריך</span>
                    <DatePicker
                        id={`${id}-end`}
                        selected={endDate}
                        onChange={handleEndChange}
                        locale="he"
                        dateFormat="dd/MM/yyyy"
                        placeholderText="בחר תאריך סיום"
                        className={`form-field__input form-field__datepicker ${displayError ? 'form-field__input--error' : ''}`}
                        disabled={disabled}
                        calendarStartDay={0}
                        showPopperArrow={false}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate ?? undefined}
                    />
                </div>
            </div>
            {displayError && (
                <span id={`${id}-error`} className="form-field__error" role="alert">
                    {displayError}
                </span>
            )}
        </div>
    );
}
