import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { User, UserRole } from '@abra-shift-master/shared';
import '../../styles/MonthLocks.css';

/**
 * Props for the MonthLockButton component
 */
interface MonthLockButtonProps {
  /** Current logged-in user */
  user: User;
  /** Click handler to open the month lock modal */
  onClick: () => void;
}

/**
 * MonthLockButton is the entry point for month lock management.
 *
 * Only visible to admin users (not just disabled).
 * When clicked, opens the MonthLockModal.
 *
 * @param props - Component props
 */
export const MonthLockButton = forwardRef<HTMLButtonElement, MonthLockButtonProps>(
  ({ user, onClick }, ref) => {
    const { t } = useTranslation();

    // Only render for admin users
    if (user.role !== UserRole.ADMIN) {
      return null;
    }

    return (
      <button
        ref={ref}
        type="button"
        className="month-lock-button"
        onClick={onClick}
        aria-label={t('monthLocks.button')}
      >
        {t('monthLocks.button')}
      </button>
    );
  }
);

MonthLockButton.displayName = 'MonthLockButton';
