import { useState, useEffect, useCallback, useRef } from 'react';
import { parseLocalDate } from '@abra-shift-master/shared';
import { FormShellProps, FormFieldSchema, FormValues, FormErrors, DateRangeValue } from './types';
import { FormHeader } from './FormHeader';
import { FormFooter } from './FormFooter';
import { CollapsibleSection } from './CollapsibleSection';
import { TextBox, LargeTextBox, DropdownBox, DateBox, DateRangeBox } from './fields';
import { FIELD_TYPES } from '../../constants/forms';
import '../../styles/FormShell.css';
import '../../styles/FormFields.css';

/**
 * Check if a field should be visible based on dependsOn config
 */
function shouldFieldBeVisible(
    field: FormFieldSchema,
    values: FormValues
): boolean {
    if (!field.dependsOn) return true;

    const parentValue = values[field.dependsOn.fieldId];
    if (typeof parentValue === 'string') {
        return field.dependsOn.values.includes(parentValue);
    }
    return false;
}

/**
 * Initialize form values from schema
 */
function initializeValues(fields: FormFieldSchema[]): FormValues {
    const values: FormValues = {};
    fields.forEach((field) => {
        if (field.type === FIELD_TYPES.DATE_RANGE_BOX) {
            values[field.id] = { start: '', end: '' };
        } else {
            values[field.id] = '';
        }
    });
    return values;
}

/**
 * FormShell is the main container for modal forms.
 * It handles state management, validation, submission logic, and accessibility (focus trap).
 *
 * @param {FormShellProps} props - Component configuration including fields schema, callbacks, and title.
 * @returns {JSX.Element} The fully rendered modal form.
 */
export function FormShell({
    title,
    subtitle,
    primaryActionLabel,
    onSubmit,
    onClose,
    fields,
    isSubmitting = false,
    serverError,
}: FormShellProps) {
    const [values, setValues] = useState<FormValues>(() => initializeValues(fields));
    const [errors, setErrors] = useState<FormErrors>({});
    const [clickCount, setClickCount] = useState(0);
    const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Focus trap - focus first focusable element on mount
    useEffect(() => {
        const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
                clickTimeoutRef.current = null;
            }
        };
    }, []);

    // Escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Double-click outside to close
    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            setClickCount((prev) => prev + 1);

            if (clickTimeoutRef.current) {
                clearTimeout(clickTimeoutRef.current);
            }

            clickTimeoutRef.current = setTimeout(() => {
                setClickCount(0);
            }, 300);

            if (clickCount >= 1) {
                onClose();
                setClickCount(0);
            }
        }
    }, [clickCount, onClose]);

    // Update field value
    const handleFieldChange = useCallback((fieldId: string, value: string | DateRangeValue) => {
        setValues((prev) => {
            const newValues = { ...prev, [fieldId]: value };

            // Clear values of fields that become hidden
            fields.forEach((field) => {
                if (field.dependsOn && !shouldFieldBeVisible(field, newValues)) {
                    if (field.type === FIELD_TYPES.DATE_RANGE_BOX) {
                        newValues[field.id] = { start: '', end: '' };
                    } else {
                        newValues[field.id] = '';
                    }
                }
            });

            return newValues;
        });

        // Clear error when value changes
        if (errors[fieldId]) {
            setErrors((prev) => ({ ...prev, [fieldId]: undefined }));
        }
    }, [fields, errors]);

    // Validate form
    const validate = useCallback((): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        fields.forEach((field) => {
            // Skip hidden fields
            if (!shouldFieldBeVisible(field, values)) return;

            if (field.required) {
                const value = values[field.id];

                if (field.type === FIELD_TYPES.DATE_RANGE_BOX) {
                    const rangeValue = value as DateRangeValue;
                    if (!rangeValue.start || !rangeValue.end) {
                        newErrors[field.id] = 'שדה חובה';
                        isValid = false;
                    } else {
                        const startDate = parseLocalDate(rangeValue.start);
                        const endDate = parseLocalDate(rangeValue.end);

                        if (startDate && endDate && endDate < startDate) {
                            newErrors[field.id] = 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה';
                            isValid = false;
                        }
                    }
                } else if (!value || (typeof value === 'string' && !value.trim())) {
                    newErrors[field.id] = 'שדה חובה';
                    isValid = false;
                }
            } else if (field.type === FIELD_TYPES.DATE_RANGE_BOX) {
                // Determine if partial range needs validation even if not required
                // (Optional: if one is filled, the other might be needed, or just validate logic if both exist)
                const rangeValue = values[field.id] as DateRangeValue;
                if (rangeValue.start && rangeValue.end) {
                    const startDate = parseLocalDate(rangeValue.start);
                    const endDate = parseLocalDate(rangeValue.end);
                    if (startDate && endDate && endDate < startDate) {
                        newErrors[field.id] = 'תאריך הסיום חייב להיות אחרי תאריך ההתחלה';
                        isValid = false;
                    }
                }
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [fields, values]);

    // Handle submit
    const handleSubmit = useCallback(() => {
        if (validate()) {
            onSubmit(values);
        }
    }, [validate, onSubmit, values]);

    // Render a single field
    const renderField = (field: FormFieldSchema) => {
        const isVisible = shouldFieldBeVisible(field, values);
        const fieldValue = values[field.id];
        const fieldError = errors[field.id];

        const fieldElement = (() => {
            switch (field.type) {
                case FIELD_TYPES.TEXT_BOX:
                    return (
                        <TextBox
                            id={field.id}
                            label={field.label}
                            placeholder={field.placeholder}
                            value={fieldValue as string}
                            required={field.required}
                            maxLength={field.maxLength}
                            error={fieldError}
                            disabled={isSubmitting}
                            onChange={(v) => handleFieldChange(field.id, v)}
                        />
                    );
                case FIELD_TYPES.PASSWORD_BOX:
                    return (
                        <TextBox
                            id={field.id}
                            label={field.label}
                            placeholder={field.placeholder}
                            value={fieldValue as string}
                            required={field.required}
                            maxLength={field.maxLength}
                            error={fieldError}
                            disabled={isSubmitting}
                            type="password"
                            onChange={(v) => handleFieldChange(field.id, v)}
                        />
                    );
                case FIELD_TYPES.LARGE_TEXT_BOX:
                    return (
                        <LargeTextBox
                            id={field.id}
                            label={field.label}
                            placeholder={field.placeholder}
                            value={fieldValue as string}
                            required={field.required}
                            maxLength={field.maxLength}
                            rows={field.rows}
                            error={fieldError}
                            disabled={isSubmitting}
                            onChange={(v) => handleFieldChange(field.id, v)}
                        />
                    );
                case FIELD_TYPES.DROPDOWN_BOX:
                    return (
                        <DropdownBox
                            id={field.id}
                            label={field.label}
                            placeholder={field.placeholder}
                            value={fieldValue as string}
                            options={field.options || []}
                            required={field.required}
                            error={fieldError}
                            disabled={isSubmitting}
                            onChange={(v) => handleFieldChange(field.id, v)}
                        />
                    );
                case FIELD_TYPES.DATE_BOX:
                    return (
                        <DateBox
                            id={field.id}
                            label={field.label}
                            placeholder={field.placeholder}
                            value={fieldValue as string}
                            required={field.required}
                            error={fieldError}
                            disabled={isSubmitting}
                            onChange={(v) => handleFieldChange(field.id, v)}
                        />
                    );
                case FIELD_TYPES.DATE_RANGE_BOX:
                    return (
                        <DateRangeBox
                            id={field.id}
                            label={field.label}
                            value={fieldValue as DateRangeValue}
                            required={field.required}
                            error={fieldError}
                            disabled={isSubmitting}
                            onChange={(v) => handleFieldChange(field.id, v)}
                        />
                    );
                default:
                    return null;
            }
        })();

        // Wrap in CollapsibleSection if field has dependsOn
        if (field.dependsOn) {
            return (
                <CollapsibleSection
                    key={field.id}
                    isVisible={isVisible}
                    collapsible={field.collapsible}
                    defaultCollapsed={field.defaultCollapsed}
                >
                    {fieldElement}
                </CollapsibleSection>
            );
        }

        return <div key={field.id}>{fieldElement}</div>;
    };

    return (
        <div
            className="form-shell__backdrop"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="form-shell-title"
        >
            <div className="form-shell__container" ref={modalRef}>
                <FormHeader
                    title={title}
                    subtitle={subtitle}
                    onClose={onClose}
                />

                <div className="form-shell__body">
                    {fields.map(renderField)}
                </div>

                <FormFooter
                    primaryActionLabel={primaryActionLabel}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    disabled={isSubmitting}
                    serverError={serverError}
                />
            </div>
        </div>
    );
}
