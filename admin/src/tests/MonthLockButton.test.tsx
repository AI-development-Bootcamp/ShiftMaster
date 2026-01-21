import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { MonthLockButton } from '../components/MonthLocks/MonthLockButton';
import { User, UserRole } from '@abra-shift-master/shared';

// Mock useTranslation
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'monthLocks.button': 'נעילת חודשים'
      };
      return translations[key] || key;
    }
  })
}));

describe('MonthLockButton', () => {
  const mockOnClick = vi.fn();

  const adminUser: User = {
    user_id: 1,
    full_name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    job_title: 'Administrator',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  };

  const regularUser: User = {
    user_id: 2,
    full_name: 'Regular User',
    email: 'user@example.com',
    role: UserRole.REGULAR,
    job_title: 'Employee',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  };

  it('renders button for admin user', () => {
    render(<MonthLockButton user={adminUser} onClick={mockOnClick} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByText('נעילת חודשים')).toBeInTheDocument();
  });

  it('does not render button for regular user', () => {
    render(<MonthLockButton user={regularUser} onClick={mockOnClick} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.queryByText('נעילת חודשים')).not.toBeInTheDocument();
  });

  it('calls onClick when admin clicks the button', async () => {
    const user = userEvent.setup();

    render(<MonthLockButton user={adminUser} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('has correct aria-label', () => {
    render(<MonthLockButton user={adminUser} onClick={mockOnClick} />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'נעילת חודשים');
  });

  it('returns null for non-admin users (not disabled)', () => {
    const { container } = render(
      <MonthLockButton user={regularUser} onClick={mockOnClick} />
    );

    // Component should render nothing (null)
    expect(container.firstChild).toBeNull();
  });
});
