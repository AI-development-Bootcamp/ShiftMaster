import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { FormShell } from '../components/FormShell';
import type { FormFieldSchema } from '../components/FormShell';

// Mock react-datepicker to avoid CSS import issues in tests
vi.mock('react-datepicker', () => ({
    default: ({ onChange, placeholderText, id }: { onChange: (date: Date | null) => void; placeholderText?: string; id?: string }) => (
        <input
            type="text"
            id={id}
            placeholder={placeholderText}
            onChange={(e) => onChange(e.target.value ? new Date(e.target.value) : null)}
        />
    ),
    registerLocale: vi.fn(),
}));

describe('FormShell', () => {
    const mockOnSubmit = vi.fn();
    const mockOnClose = vi.fn();

    const basicFields: FormFieldSchema[] = [
        {
            id: 'name',
            type: 'textBox',
            label: 'שם',
            placeholder: 'הכנס שם',
            required: true,
        },
        {
            id: 'description',
            type: 'largeTextBox',
            label: 'תיאור',
            placeholder: 'הכנס תיאור',
        },
    ];

    beforeEach(() => {
        mockOnSubmit.mockClear();
        mockOnClose.mockClear();
    });

    describe('Rendering', () => {
        it('renders modal with title and subtitle', () => {
            render(
                <FormShell
                    title="יצירת משימה"
                    subtitle="מלא את הפרטים"
                    primaryActionLabel="צור"
                    fields={basicFields}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                />
            );

            expect(screen.getByText('יצירת משימה')).toBeInTheDocument();
            expect(screen.getByText('מלא את הפרטים')).toBeInTheDocument();
        });

        it('renders all fields from schema', () => {
            render(
                <FormShell
                    title="טופס"
                    primaryActionLabel="שלח"
                    fields={basicFields}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                />
            );

            expect(screen.getByLabelText(/שם/)).toBeInTheDocument();
            expect(screen.getByLabelText(/תיאור/)).toBeInTheDocument();
        });

        it('renders submit button with correct label', () => {
            render(
                <FormShell
                    title="טופס"
                    primaryActionLabel="צור משימה"
                    fields={basicFields}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                />
            );

            expect(screen.getByRole('button', { name: /צור משימה/i })).toBeInTheDocument();
        });

        it('renders close button', () => {
            render(
                <FormShell
                    title="טופס"
                    primaryActionLabel="שלח"
                    fields={basicFields}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                />
            );

            expect(screen.getByRole('button', { name: /סגור טופס/i })).toBeInTheDocument();
        });
    });

    describe('Validation', () => {
        it('shows error for empty required field on submit', async () => {
            render(
                <FormShell
                    title="טופס"
                    primaryActionLabel="שלח"
                    fields={basicFields}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                />
            );

            const submitButton = screen.getByRole('button', { name: /שלח/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('שדה חובה')).toBeInTheDocument();
            });

            expect(mockOnSubmit).not.toHaveBeenCalled();
        });

        it('submits form when required fields are filled', async () => {
            render(
                <FormShell
                    title="טופס"
                    primaryActionLabel="שלח"
                    fields={basicFields}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                />
            );

            const nameInput = screen.getByLabelText(/שם/);
            fireEvent.change(nameInput, { target: { value: 'משימה חדשה' } });

            const submitButton = screen.getByRole('button', { name: /שלח/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockOnSubmit).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'משימה חדשה',
                    })
                );
            });
        });

        it('clears error when field value changes', async () => {
            render(
                <FormShell
                    title="טופס"
                    primaryActionLabel="שלח"
                    fields={basicFields}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                />
            );

            // Trigger validation error
            const submitButton = screen.getByRole('button', { name: /שלח/i });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText('שדה חובה')).toBeInTheDocument();
            });

            // Fill the field
            const nameInput = screen.getByLabelText(/שם/);
            fireEvent.change(nameInput, { target: { value: 'ערך כלשהו' } });

            await waitFor(() => {
                expect(screen.queryByText('שדה חובה')).not.toBeInTheDocument();
            });
        });
    });

    describe('Conditional Visibility', () => {
        const fieldsWithDependency: FormFieldSchema[] = [
            {
                id: 'role',
                type: 'dropdownBox',
                label: 'תפקיד',
                options: [
                    { value: 'regular', label: 'עובד רגיל' },
                    { value: 'admin', label: 'מנהל מערכת' },
                ],
            },
            {
                id: 'job_title',
                type: 'textBox',
                label: 'תואר תפקיד',
                placeholder: 'הכנס תואר',
                dependsOn: {
                    fieldId: 'role',
                    values: ['admin'],
                },
            },
        ];

        it('hides dependent field when parent value does not match', () => {
            render(
                <FormShell
                    title="טופס"
                    primaryActionLabel="שלח"
                    fields={fieldsWithDependency}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                />
            );

            // Initially job_title should not be visible (role is empty)
            expect(screen.queryByLabelText(/תואר תפקיד/)).not.toBeInTheDocument();
        });

        it('shows dependent field when parent value matches', async () => {
            render(
                <FormShell
                    title="טופס"
                    primaryActionLabel="שלח"
                    fields={fieldsWithDependency}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                />
            );

            // Select admin role
            const roleSelect = screen.getByLabelText(/תפקיד/);
            fireEvent.change(roleSelect, { target: { value: 'admin' } });

            await waitFor(() => {
                expect(screen.getByLabelText(/תואר תפקיד/)).toBeInTheDocument();
            });
        });

        it('hides dependent field and clears value when parent changes', async () => {
            render(
                <FormShell
                    title="טופס"
                    primaryActionLabel="שלח"
                    fields={fieldsWithDependency}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                />
            );

            // Select admin and fill job_title
            const roleSelect = screen.getByLabelText(/תפקיד/);
            fireEvent.change(roleSelect, { target: { value: 'admin' } });

            await waitFor(() => {
                expect(screen.getByLabelText(/תואר תפקיד/)).toBeInTheDocument();
            });

            const jobTitleInput = screen.getByLabelText(/תואר תפקיד/);
            fireEvent.change(jobTitleInput, { target: { value: 'ראש צוות' } });

            // Change to regular - job_title should be hidden
            fireEvent.change(roleSelect, { target: { value: 'regular' } });

            await waitFor(() => {
                expect(screen.queryByLabelText(/תואר תפקיד/)).not.toBeInTheDocument();
            });
        });
    });

    describe('Modal Behavior', () => {
        it('calls onClose when close button is clicked', () => {
            render(
                <FormShell
                    title="טופס"
                    primaryActionLabel="שלח"
                    fields={basicFields}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                />
            );

            const closeButton = screen.getByRole('button', { name: /סגור טופס/i });
            fireEvent.click(closeButton);

            expect(mockOnClose).toHaveBeenCalled();
        });

        it('calls onClose when Escape key is pressed', () => {
            render(
                <FormShell
                    title="טופס"
                    primaryActionLabel="שלח"
                    fields={basicFields}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                />
            );

            fireEvent.keyDown(document, { key: 'Escape' });

            expect(mockOnClose).toHaveBeenCalled();
        });

        it('disables fields and submit button when isSubmitting is true', () => {
            render(
                <FormShell
                    title="טופס"
                    primaryActionLabel="שלח"
                    fields={basicFields}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                    isSubmitting={true}
                />
            );

            expect(screen.getByLabelText(/שם/)).toBeDisabled();
            expect(screen.getByRole('button', { name: /שלח/i })).toBeDisabled();
        });

        it('displays server error when provided', () => {
            render(
                <FormShell
                    title="טופס"
                    primaryActionLabel="שלח"
                    fields={basicFields}
                    onSubmit={mockOnSubmit}
                    onClose={mockOnClose}
                    serverError="שגיאה בשרת"
                />
            );

            expect(screen.getByText('שגיאה בשרת')).toBeInTheDocument();
        });
    });
});
