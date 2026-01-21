import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { YearNavigator } from '../components/MonthLocks/YearNavigator';

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'monthLocks.yearNavigator.previousYear': 'שנה קודמת',
        'monthLocks.yearNavigator.nextYear': 'שנה הבאה'
      };
      return translations[key] || key;
    }
  })
}));

describe('YearNavigator', () => {
  const mockOnPreviousYear = vi.fn();
  const mockOnNextYear = vi.fn();

  it('displays the current year', () => {
    render(
      <YearNavigator
        year={2024}
        onPreviousYear={mockOnPreviousYear}
        onNextYear={mockOnNextYear}
      />
    );

    expect(screen.getByText('2024')).toBeInTheDocument();
  });

  it('calls onPreviousYear when previous button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <YearNavigator
        year={2024}
        onPreviousYear={mockOnPreviousYear}
        onNextYear={mockOnNextYear}
      />
    );

    const prevButton = screen.getByLabelText('שנה קודמת');
    await user.click(prevButton);

    expect(mockOnPreviousYear).toHaveBeenCalledTimes(1);
  });

  it('calls onNextYear when next button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <YearNavigator
        year={2024}
        onPreviousYear={mockOnPreviousYear}
        onNextYear={mockOnNextYear}
      />
    );

    const nextButton = screen.getByLabelText('שנה הבאה');
    await user.click(nextButton);

    expect(mockOnNextYear).toHaveBeenCalledTimes(1);
  });

  it('updates displayed year when prop changes', () => {
    const { rerender } = render(
      <YearNavigator
        year={2024}
        onPreviousYear={mockOnPreviousYear}
        onNextYear={mockOnNextYear}
      />
    );

    expect(screen.getByText('2024')).toBeInTheDocument();

    rerender(
      <YearNavigator
        year={2025}
        onPreviousYear={mockOnPreviousYear}
        onNextYear={mockOnNextYear}
      />
    );

    expect(screen.getByText('2025')).toBeInTheDocument();
    expect(screen.queryByText('2024')).not.toBeInTheDocument();
  });

  it('has aria-live region for accessibility', () => {
    render(
      <YearNavigator
        year={2024}
        onPreviousYear={mockOnPreviousYear}
        onNextYear={mockOnNextYear}
      />
    );

    const yearDisplay = screen.getByText('2024');
    expect(yearDisplay).toHaveAttribute('aria-live', 'polite');
  });
});
