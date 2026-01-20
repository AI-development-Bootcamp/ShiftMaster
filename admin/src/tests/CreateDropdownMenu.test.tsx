import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom'; // Import matchers for toBeInTheDocument
import { CreateDropdownMenu } from '../components/CreateDropdownMenu';
import { CreateMenuOption } from '../components/CreateDropdownMenu/types';

describe('CreateDropdownMenu', () => {
    const mockOptions: CreateMenuOption[] = [
        { id: '1', label: 'Option 1', onSelect: vi.fn() },
        { id: '2', label: 'Option 2', onSelect: vi.fn() },
        { id: '3', label: 'Disabled Option', disabled: true, onSelect: vi.fn() },
    ];

    it('renders the trigger button with the correct label', () => {
        render(<CreateDropdownMenu options={mockOptions} label="Test Menu" />);
        expect(screen.getByText('Test Menu')).toBeInTheDocument();
    });

    it('does not show the dropdown initially', () => {
        render(<CreateDropdownMenu options={mockOptions} />);
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('opens the dropdown when the trigger button is clicked', () => {
        render(<CreateDropdownMenu options={mockOptions} />);
        const button = screen.getByRole('button');
        fireEvent.click(button);
        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.getByText('Option 1')).toBeInTheDocument();
    });

    it('calls onSelect and closes the menu when an option is clicked', () => {
        render(<CreateDropdownMenu options={mockOptions} />);

        // Open menu
        fireEvent.click(screen.getByRole('button'));

        // Click option 1
        fireEvent.click(screen.getByText('Option 1'));

        expect(mockOptions[0].onSelect).toHaveBeenCalled();
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('does not call onSelect when a disabled option is clicked', () => {
        render(<CreateDropdownMenu options={mockOptions} />);

        // Open menu
        fireEvent.click(screen.getByRole('button'));

        // Click disabled option
        fireEvent.click(screen.getByText('Disabled Option'));

        expect(mockOptions[2].onSelect).not.toHaveBeenCalled();
        // Menu should stay open (or close depending on implementation, but typically interactions with disabled items do nothing)
        // Checking implementation: if (disabled) return; -> setIsOpen is NOT called. So menu stays open.
        expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('closes the menu when clicking outside', () => {
        render(
            <div>
                <CreateDropdownMenu options={mockOptions} />
                <div data-testid="outside">Outside</div>
            </div>
        );

        // Open menu
        fireEvent.click(screen.getByText('יצירה')); // Default label
        expect(screen.getByRole('menu')).toBeInTheDocument();

        // Click outside
        fireEvent.mouseDown(screen.getByTestId('outside'));

        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('closes the menu when pressing Escape', () => {
        render(<CreateDropdownMenu options={mockOptions} />);

        // Open menu
        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByRole('menu')).toBeInTheDocument();

        // Press Escape
        fireEvent.keyDown(document, { key: 'Escape' });

        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
});
