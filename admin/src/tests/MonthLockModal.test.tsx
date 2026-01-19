import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { MonthLockModal } from '../components/MonthLocks/MonthLockModal';

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'monthLocks.modalTitle': 'ניהול נעילת חודשים',
        'monthLocks.closeModal': 'סגור',
        'monthLocks.loading': 'טוען נתוני נעילה...',
        'monthLocks.yearNavigator.previousYear': 'שנה קודמת',
        'monthLocks.yearNavigator.nextYear': 'שנה הבאה',
        'monthNames.january': 'ינואר',
        'monthNames.february': 'פברואר',
        'monthNames.march': 'מרץ',
        'monthNames.april': 'אפריל',
        'monthNames.may': 'מאי',
        'monthNames.june': 'יוני',
        'monthNames.july': 'יולי',
        'monthNames.august': 'אוגוסט',
        'monthNames.september': 'ספטמבר',
        'monthNames.october': 'אוקטובר',
        'monthNames.november': 'נובמבר',
        'monthNames.december': 'דצמבר'
      };
      return translations[key] || key;
    }
  })
}));

describe('MonthLockModal', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('does not render when isOpen is false', () => {
    render(<MonthLockModal isOpen={false} onClose={mockOnClose} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders modal when isOpen is true', async () => {
    render(<MonthLockModal isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText('ניהול נעילת חודשים')).toBeInTheDocument();
  });

  it('displays year navigator', async () => {
    render(<MonthLockModal isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      const currentYear = new Date().getFullYear().toString();
      expect(screen.getByText(currentYear)).toBeInTheDocument();
    });
  });

  it('displays 12 month tiles after loading', async () => {
    render(<MonthLockModal isOpen={true} onClose={mockOnClose} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('ינואר')).toBeInTheDocument();
    });

    // Check all 12 months are present
    expect(screen.getByText('ינואר')).toBeInTheDocument();
    expect(screen.getByText('פברואר')).toBeInTheDocument();
    expect(screen.getByText('מרץ')).toBeInTheDocument();
    expect(screen.getByText('אפריל')).toBeInTheDocument();
    expect(screen.getByText('מאי')).toBeInTheDocument();
    expect(screen.getByText('יוני')).toBeInTheDocument();
    expect(screen.getByText('יולי')).toBeInTheDocument();
    expect(screen.getByText('אוגוסט')).toBeInTheDocument();
    expect(screen.getByText('ספטמבר')).toBeInTheDocument();
    expect(screen.getByText('אוקטובר')).toBeInTheDocument();
    expect(screen.getByText('נובמבר')).toBeInTheDocument();
    expect(screen.getByText('דצמבר')).toBeInTheDocument();
  });

  it('closes modal when X button is clicked', async () => {
    const user = userEvent.setup();

    render(<MonthLockModal isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByLabelText('סגור');
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('closes modal when overlay is clicked', async () => {
    const user = userEvent.setup();

    const { container } = render(<MonthLockModal isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Click the overlay (not the dropdown itself)
    const overlay = container.querySelector('.month-lock-overlay');
    if (overlay) {
      await user.click(overlay);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('closes modal when ESC key is pressed', async () => {
    const user = userEvent.setup();

    render(<MonthLockModal isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    await user.keyboard('{Escape}');

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('navigates to previous year', async () => {
    const user = userEvent.setup();

    render(<MonthLockModal isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(currentYear.toString())).toBeInTheDocument();

    const prevButton = screen.getByLabelText('שנה קודמת');
    await user.click(prevButton);

    await waitFor(() => {
      expect(screen.getByText((currentYear - 1).toString())).toBeInTheDocument();
    });
  });

  it('navigates to next year', async () => {
    const user = userEvent.setup();

    render(<MonthLockModal isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(currentYear.toString())).toBeInTheDocument();

    const nextButton = screen.getByLabelText('שנה הבאה');
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.getByText((currentYear + 1).toString())).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', async () => {
    render(<MonthLockModal isOpen={true} onClose={mockOnClose} />);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'month-lock-modal-title');
    });
  });
});
