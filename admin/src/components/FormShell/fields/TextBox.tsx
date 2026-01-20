import { useState } from 'react';
import { TextBoxProps } from '../types';
import { EyeIcon, EyeOffIcon } from '../../../constants/icons';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;
    const isPassword = type === 'password';

    const safeT = (key: string) => {
        const translated = t(key);
        if (translated === key) {
            console.error({ code: 'TEXTBOX_I18N_MISSING', message: 'Missing translation', key, value: translated });
            return key;
        }
        return translated;
    };

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
                        aria-label={showPassword ? safeT('formShell.textBox.hidePassword') : safeT('formShell.textBox.showPassword')}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <EyeOffIcon />
                        ) : (
                            <EyeIcon />
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
