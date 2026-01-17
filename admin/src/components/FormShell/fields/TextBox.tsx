import { useState } from 'react';
import { TextBoxProps } from '../types';

/**
 * TextBox component for single-line text input.
 * Supports password visibility toggle and validation states.
 *
 * @param {TextBoxProps} props - Component props including label, value, type, and error state.
 * @returns {JSX.Element} The rendered text input field.
 */
export function TextBox({
    id,
    label,
    placeholder,
    value,
    required,
    maxLength,
    error,
    disabled,
    type = 'text',
    onChange,
}: TextBoxProps) {
    const [showPassword, setShowPassword] = useState(false);

    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;
    const isPassword = type === 'password';

    return (
        <div className="form-field">
            <label htmlFor={id} className="form-field__label">
                {label}
                {required && <span className="form-field__required">*</span>}
            </label>
            <div className={`form-field__input-wrapper ${isPassword ? 'form-field__input-wrapper--password' : ''}`}>
                <input
                    type={inputType}
                    id={id}
                    name={id}
                    className={`form-field__input ${error ? 'form-field__input--error' : ''}`}
                    placeholder={placeholder}
                    value={value}
                    maxLength={maxLength}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${id}-error` : undefined}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="form-field__password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'הסתר סיסמה' : 'הצג סיסמה'}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
            {error && (
                <span id={`${id}-error`} className="form-field__error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
}
