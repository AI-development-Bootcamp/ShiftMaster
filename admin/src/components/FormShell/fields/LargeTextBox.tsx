import { LargeTextBoxProps } from '../types';

/**
 * LargeTextBox - Multi-line textarea field
 */
export function LargeTextBox({
    id,
    label,
    placeholder,
    value,
    required,
    maxLength,
    rows = 4,
    error,
    disabled,
    onChange,
}: LargeTextBoxProps) {
    return (
        <div className="form-field">
            <label htmlFor={id} className="form-field__label">
                {label}
                {required && <span className="form-field__required">*</span>}
            </label>
            <textarea
                id={id}
                name={id}
                className={`form-field__textarea ${error ? 'form-field__textarea--error' : ''}`}
                placeholder={placeholder}
                value={value}
                maxLength={maxLength}
                rows={rows}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? `${id}-error` : undefined}
            />
            {error && (
                <span id={`${id}-error`} className="form-field__error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
