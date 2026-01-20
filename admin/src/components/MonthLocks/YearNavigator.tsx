
import { useTranslation } from 'react-i18next';
import '../../styles/MonthLocks.css';

/**
 * Props for the YearNavigator component
 */
interface YearNavigatorProps {
  /** Current year being displayed */
  year: number;
  /** Handler for previous year button */
  onPreviousYear: () => void;
  /** Handler for next year button */
  onNextYear: () => void;
}

/**
 * YearNavigator provides controls for navigating between years.
 *
 * Displays the current year with previous/next buttons.
 * No limit on past navigation, unlimited future navigation by default.
 *
 * @param props - Component props
 */
export function YearNavigator({ year, onPreviousYear, onNextYear }: YearNavigatorProps) {
  const { t } = useTranslation();

  return (
    <div className="year-navigator">
      <button
        type="button"
        className="year-nav-button year-nav-button--prev"
        onClick={onPreviousYear}
        aria-label={t('monthLocks.yearNavigator.previousYear')}
      >
        ▶
      </button>
      <span className="year-display" aria-live="polite">
        {year}
      </span>
      <button
        type="button"
        className="year-nav-button year-nav-button--next"
        onClick={onNextYear}
        aria-label={t('monthLocks.yearNavigator.nextYear')}
      >
        ◀
      </button>
    </div>
  );
}
