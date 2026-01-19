
import '../../styles/MonthLocks.css';

/**
 * Props for the MonthTile component
 */
interface MonthTileProps {
  /** Hebrew month name (e.g., "ינואר") */
  monthName: string;
  /** Whether the month is currently locked */
  isLocked: boolean;
  /** Click handler for toggling lock state */
  onClick: () => void;
}

/**
 * MonthTile displays a single month in the month lock grid.
 *
 * Visual states:
 * - Locked: Red background
 * - Unlocked: Gray background
 *
 * @param props - Component props
 */
export function MonthTile({ monthName, isLocked, onClick }: MonthTileProps) {
  return (
    <button
      type="button"
      className={`month-tile ${isLocked ? 'month-tile--locked' : 'month-tile--unlocked'}`}
      onClick={onClick}
      aria-label={`${monthName} - ${isLocked ? 'נעול' : 'פתוח'}`}
      aria-pressed={isLocked}
    >
      <span className="month-tile-name">{monthName}</span>
    </button>
  );
}
