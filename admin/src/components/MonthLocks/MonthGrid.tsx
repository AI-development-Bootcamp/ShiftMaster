
import { useTranslation } from 'react-i18next';
import { MonthLock } from '@abra-shift-master/shared';
import { MonthTile } from './MonthTile';
import '../../styles/MonthLocks.css';

/**
 * Props for the MonthGrid component
 */
interface MonthGridProps {
  /** Year being displayed */
  year: number;
  /** Array of month locks for the current year */
  locks: MonthLock[];
  /** Handler for toggling a month lock */
  onToggleLock: (year: number, month: number) => void;
  /** Whether data is loading */
  isLoading: boolean;
}

/**
 * Month names in order (1-12)
 */
const MONTH_KEYS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december'
];

/**
 * MonthGrid displays a 12-month grid for lock management.
 *
 * Shows loading skeleton when isLoading is true.
 * Renders 12 tiles (January-December) with Hebrew names.
 * Supports RTL layout.
 *
 * @param props - Component props
 */
export function MonthGrid({ year, locks, onToggleLock, isLoading }: MonthGridProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="month-grid" role="status" aria-label={t('monthLocks.loading')}>
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="month-tile month-tile--skeleton" aria-hidden="true">
            <span className="month-tile-name">&nbsp;</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="month-grid" role="grid" aria-label={t('monthLocks.gridLabel')}>
      {MONTH_KEYS.map((monthKey, index) => {
        const monthNumber = index + 1;
        const monthName = t(`monthNames.${monthKey}`);
        const isLocked = locks.some(lock => lock.month === monthNumber);

        return (
          <MonthTile
            key={monthNumber}
            monthName={monthName}
            isLocked={isLocked}
            onClick={() => onToggleLock(year, monthNumber)}
          />
        );
      })}
    </div>
  );
}
