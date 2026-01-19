import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { MonthTile } from '../components/MonthLocks/MonthTile';

describe('MonthTile', () => {
  const mockOnClick = vi.fn();

  it('renders month name', () => {
    render(
      <MonthTile monthName="ינואר" isLocked={false} onClick={mockOnClick} />
    );

    expect(screen.getByText('ינואר')).toBeInTheDocument();
  });

  it('applies unlocked class when month is not locked', () => {
    render(
      <MonthTile monthName="ינואר" isLocked={false} onClick={mockOnClick} />
    );

    const tile = screen.getByRole('button');
    expect(tile).toHaveClass('month-tile--unlocked');
    expect(tile).not.toHaveClass('month-tile--locked');
  });

  it('applies locked class when month is locked', () => {
    render(
      <MonthTile monthName="ינואר" isLocked={true} onClick={mockOnClick} />
    );

    const tile = screen.getByRole('button');
    expect(tile).toHaveClass('month-tile--locked');
    expect(tile).not.toHaveClass('month-tile--unlocked');
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();

    render(
      <MonthTile monthName="ינואר" isLocked={false} onClick={mockOnClick} />
    );

    const tile = screen.getByRole('button');
    await user.click(tile);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('has correct aria-label for unlocked month', () => {
    render(
      <MonthTile monthName="ינואר" isLocked={false} onClick={mockOnClick} />
    );

    const tile = screen.getByRole('button');
    expect(tile).toHaveAttribute('aria-label', 'ינואר - פתוח');
  });

  it('has correct aria-label for locked month', () => {
    render(
      <MonthTile monthName="ינואר" isLocked={true} onClick={mockOnClick} />
    );

    const tile = screen.getByRole('button');
    expect(tile).toHaveAttribute('aria-label', 'ינואר - נעול');
  });

  it('has correct aria-pressed state', () => {
    const { rerender } = render(
      <MonthTile monthName="ינואר" isLocked={false} onClick={mockOnClick} />
    );

    let tile = screen.getByRole('button');
    expect(tile).toHaveAttribute('aria-pressed', 'false');

    rerender(
      <MonthTile monthName="ינואר" isLocked={true} onClick={mockOnClick} />
    );

    tile = screen.getByRole('button');
    expect(tile).toHaveAttribute('aria-pressed', 'true');
  });
});
