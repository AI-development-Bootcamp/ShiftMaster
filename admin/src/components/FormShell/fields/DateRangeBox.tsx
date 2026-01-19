import { useState, useEffect, useMemo } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { he } from 'date-fns/locale';
import { formatDate, parseLocalDate } from '@abra-shift-master/shared';
import { DateRangeBoxProps } from '../types';
import { useTranslation } from 'react-i18next';
import 'react-datepicker/dist/react-datepicker.css';

// Register Hebrew locale
registerLocale('he', he);

/**
 * DateRangeBox component for selecting a start and end date range.
 * Includes cross-field validation to ensure end date is after start date.
 *
 * @param {DateRangeBoxProps} props - Component props including label, value range, and error state.
 * @returns {JSX.Element} The rendered date range picker fields.
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
    const { t } = useTranslation();
    const [internalError, setInternalError] = useState<string | undefined>();

    // Parse string dates to Date objects using shared utility
    const startDate = useMemo(() => parseLocalDate(value.start), [value.start]);
    const endDate = useMemo(() => parseLocalDate(value.end), [value.end]);

    // Cross-field validation
    useEffect(() => {
        if (startDate && endDate && endDate < startDate) {
            setInternalError(t('formShell.dateRangeBox.validationError'));
        } else {
            setInternalError(undefined);
        }
    }, [startDate, endDate, t]);

    const handleStartChange = (date: Date | null) => {
        const formatted = date ? formatDate(date) : '';
        onChange({ ...value, start: formatted });
    };

    const handleEndChange = (date: Date | null) => {
        const formatted = date ? formatDate(date) : '';
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
                    <span className="form-field__date-range-label">{t('formShell.dateRangeBox.startDateLabel')}</span>
                    <DatePicker
                        id={`${id}-start`}
                        selected={startDate}
                        onChange={handleStartChange}
                        locale="he"
                        dateFormat="dd/MM/yyyy"
                        placeholderText={t('formShell.dateRangeBox.startDatePlaceholder')}
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
                    <span className="form-field__date-range-label">{t('formShell.dateRangeBox.endDateLabel')}</span>
                    <DatePicker
                        id={`${id}-end`}
                        selected={endDate}
                        onChange={handleEndChange}
                        locale="he"
                        dateFormat="dd/MM/yyyy"
                        placeholderText={t('formShell.dateRangeBox.endDatePlaceholder')}
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
