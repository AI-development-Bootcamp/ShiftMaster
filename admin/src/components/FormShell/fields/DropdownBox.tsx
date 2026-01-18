import { useState, useRef, useEffect } from 'react';
import { DropdownBoxProps } from '../types';

/**
 * DropdownBox component for selecting an option from a list.
 * Features a custom UI with click-outside closing and arrow indication.
 *
 * @param {DropdownBoxProps} props - Component props including options, selected value, and error state.
 * @returns {JSX.Element} The rendered custom dropdown field.
 */
export function DropdownBox({
    id,
    label,
    placeholder,
    value,
    options,
    required,
    error,
    disabled,
    onChange,
}: DropdownBoxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Find selected option label
    const selectedOption = options.find((opt) => opt.value === value);
    const displayValue = selectedOption ? selectedOption.label : placeholder || 'בחר אפשרות';

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className="form-field" ref={containerRef}>
            <label htmlFor={id} className="form-field__label">
                {label}
                {required && <span className="form-field__required">*</span>}
            </label>

            <div className="form-field__dropdown-container">
                <button
                    type="button"
                    id={id}
                    className={`form-field__dropdown-trigger ${error ? 'form-field__dropdown-trigger--error' : ''} ${isOpen ? 'form-field__dropdown-trigger--open' : ''}`}
                    disabled={disabled}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    aria-invalid={error ? 'true' : 'false'}
                >
                    <span className={`form-field__dropdown-value ${!selectedOption ? 'form-field__dropdown-value--placeholder' : ''}`}>
                        {displayValue}
                    </span>
                    <span className="form-field__dropdown-arrow">▼</span>
                </button>

                {isOpen && (
                    <div className="form-field__dropdown-menu" role="listbox">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                className={`form-field__dropdown-option ${option.value === value ? 'form-field__dropdown-option--selected' : ''}`}
                                onClick={() => handleSelect(option.value)}
                                role="option"
                                aria-selected={option.value === value}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
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
