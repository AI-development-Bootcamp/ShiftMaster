import { ReactNode } from 'react';

// ============================================
// Field Type Definitions
// ============================================

/**
 * Available field types for FormShell
 */
export type FormFieldType =
    | 'textBox'
    | 'passwordBox'
    | 'largeTextBox'
    | 'dropdownBox'
    | 'dateBox'
    | 'dateRangeBox';

/**
 * Dropdown option structure
 */
export interface DropdownOption {
    value: string;
    label: string;
}

/**
 * Defines conditional visibility for a field
 * Field will only appear when the parent field's value matches one of the allowed values
 */
export interface FieldDependency {
    fieldId: string;    // The field this depends on
    values: string[];   // Show when parent has one of these values
}

/**
 * Schema definition for a single form field
 */
export interface FormFieldSchema {
    id: string;
    type: FormFieldType;
    label: string;
    placeholder?: string;
    options?: DropdownOption[];  // For dropdownBox
    required?: boolean;
    maxLength?: number;
    rows?: number;                 // For largeTextBox
    dependsOn?: FieldDependency;   // Conditional visibility
    collapsible?: boolean;         // Can be collapsed when visible
    defaultCollapsed?: boolean;    // Start collapsed
}

// ============================================
// Date Range Value Type
// ============================================

/**
 * Value returned by DateRangeBox
 */
export interface DateRangeValue {
    start: string;
    end: string;
}

// ============================================
// Form Values & Errors
// ============================================

/**
 * Form field values - string for most fields, DateRangeValue for dateRangeBox
 */
export type FormValues = Record<string, string | DateRangeValue>;

/**
 * Validation errors keyed by field id
 */
export type FormErrors = Record<string, string | undefined>;

// ============================================
// Component Props
// ============================================

/**
 * Props for the main FormShell component
 */
export interface FormShellProps {
    title: string;
    subtitle?: string;
    primaryActionLabel: string;
    onSubmit: (values: FormValues) => void | Promise<void>;
    onClose: () => void;
    fields: FormFieldSchema[];
    isSubmitting?: boolean;
    serverError?: string;  // General error from server
    initialValues?: FormValues; // Pre-filled values for edit mode
}

/**
 * Props for FormHeader component
 */
export interface FormHeaderProps {
    title: string;
    subtitle?: string;
    onClose: () => void;
}

/**
 * Props for FormFooter component
 */
export interface FormFooterProps {
    primaryActionLabel: string;
    onSubmit: () => void;
    isSubmitting?: boolean;
    disabled?: boolean;
    serverError?: string;
}

/**
 * Base props shared by all field components
 */
export interface BaseFieldProps {
    id: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
}

/**
 * Props for TextBox component
 */
export interface TextBoxProps extends BaseFieldProps {
    value: string;
    maxLength?: number;
    type?: 'text' | 'password' | 'email';
    onChange: (value: string) => void;
}

/**
 * Props for LargeTextBox component
 */
export interface LargeTextBoxProps extends BaseFieldProps {
    value: string;
    maxLength?: number;
    rows?: number;
    onChange: (value: string) => void;
}

/**
 * Props for DropdownBox component
 */
export interface DropdownBoxProps extends BaseFieldProps {
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
}

/**
 * Props for DateBox component
 */
export interface DateBoxProps extends BaseFieldProps {
    value: string;
    onChange: (value: string) => void;
}

/**
 * Props for DateRangeBox component
 */
export interface DateRangeBoxProps extends BaseFieldProps {
    value: DateRangeValue;
    onChange: (value: DateRangeValue) => void;
}

/**
 * Props for CollapsibleSection component
 */
export interface CollapsibleSectionProps {
    children: ReactNode;
    isVisible: boolean;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
}
