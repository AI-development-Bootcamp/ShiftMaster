import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { YearNavigator } from './YearNavigator';
import { MonthGrid } from './MonthGrid';
import { useMonthLocks } from '../../hooks/useMonthLocks';
import { useAppSelector } from '../../store';
import '../../styles/MonthLocks.css';

/**
 * Props for the MonthLockModal component
 */
interface MonthLockModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Handler for closing the modal */
  onClose: () => void;
  /** Reference to the button element for positioning */
  buttonRef?: React.RefObject<HTMLButtonElement>;
}

/**
 * MonthLockModal provides a modal interface for managing month locks.
 *
 * Features:
 * - Year navigation (infinite past, unlimited future)
 * - 12-month grid with Hebrew names
 * - Lock/unlock toggle with optimistic updates
 * - Close via X button, overlay click, or ESC key
 * - Focus trap within modal
 * - RTL layout
 *
 * @param props - Component props
 */
export function MonthLockModal({ isOpen, onClose, buttonRef }: MonthLockModalProps) {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);

  // Get admin user ID from Redux auth state
  const userId = useAppSelector((state) => state.auth.user?.user_id ?? '');

  const { locks, isLoading, toggleLock, saveChanges, hasChanges } = useMonthLocks(year, userId);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [saveError, setSaveError] = useState<string | null>(null);

  // Handle ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Calculate position based on button location
  useEffect(() => {
    if (isOpen && buttonRef?.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
    }
  }, [isOpen, buttonRef]);

  // Focus trap: Focus modal when opened
  useEffect(() => {
    if (isOpen) {
      const modalElement = document.querySelector('.month-lock-dropdown') as HTMLElement;
      if (modalElement) {
        modalElement.focus();
      }
    }
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Year navigation handlers
  const handlePreviousYear = useCallback(() => {
    setYear(prev => prev - 1);
  }, []);

  const handleNextYear = useCallback(() => {
    setYear(prev => prev + 1);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="month-lock-overlay"
        onClick={handleOverlayClick}
        role="presentation"
      />
      <div
        className="month-lock-dropdown"
        role="dialog"
        aria-modal="true"
        aria-labelledby="month-lock-modal-title"
        tabIndex={-1}
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`
        }}
      >
        <div className="month-lock-dropdown-header">
          <h2 id="month-lock-modal-title" className="month-lock-dropdown-title">
            {t('monthLocks.modalTitle')}
          </h2>
          <button
            type="button"
            className="month-lock-dropdown-close"
            onClick={onClose}
            aria-label={t('monthLocks.closeModal')}
          >
            ×
          </button>
        </div>

        <div className="month-lock-dropdown-body">
          <YearNavigator
            year={year}
            onPreviousYear={handlePreviousYear}
            onNextYear={handleNextYear}
          />
          <MonthGrid
            year={year}
            locks={locks}
            onToggleLock={toggleLock}
            isLoading={isLoading}
          />
        </div>

        <div className="month-lock-dropdown-footer">
          {saveError && (
            <div className="month-lock-error-message" role="alert" style={{ marginBottom: '8px', color: 'red', fontSize: '14px' }}>
              {saveError}
            </div>
          )}
          <button
            type="button"
            className="month-lock-save-button"
            disabled={!hasChanges}
            onClick={async () => {
              try {
                setSaveError(null);
                await saveChanges();
                onClose();
              } catch (error) {
                console.error({ code: 'MONTH_LOCK_SAVE_FAIL', error });
                setSaveError(t('monthLocks.errors.saveFailed') || 'Failed to save changes');
              }
            }}
          >
            {t('monthLocks.actions.save')}
          </button>
        </div>
      </div>
    </>
  );
}
