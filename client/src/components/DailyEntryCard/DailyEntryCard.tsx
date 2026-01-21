import { useState, useEffect } from 'react';
import StatusBadge, { EntryStatus } from '../StatusBadge/StatusBadge';
import TimeEntryItem, { TimeEntry } from '../TimeEntryItem/TimeEntryItem';
import '../../styles/DailyEntryCard.css';

export type AbsenceType =
  | 'vacation-half'
  | 'vacation-full'
  | 'sick'
  | 'reserves'
  | null;

export interface DailyEntry {
  id: string;
  date: string;
  dayName: string;
  status: EntryStatus;
  hours?: number;
  timeEntries: TimeEntry[];
  absenceType?: AbsenceType;
}

interface DailyEntryCardProps {
  entry: DailyEntry;
  isExpanded?: boolean;
  onToggle?: (id: string) => void;
  onEditEntry?: (entryId: string) => void;
  onAddReport?: (dayId: string) => void;
}

function DailyEntryCard({
  entry,
  isExpanded = false,
  onToggle,
  onEditEntry,
  onAddReport,
}: DailyEntryCardProps) {
  const [expanded, setExpanded] = useState(isExpanded);

  // Sync local expanded state with prop changes
  useEffect(() => {
    setExpanded(isExpanded);
  }, [isExpanded]);

  const handleToggle = () => {
    const newState = !expanded;
    setExpanded(newState);
    if (onToggle) {
      onToggle(entry.id);
    }
  };

  const handleAddReport = () => {
    if (onAddReport) {
      onAddReport(entry.id);
    }
  };

  const panelId = `${entry.id}-panel`;

  return (
    <div
      className={`daily-entry-card ${expanded ? 'daily-entry-card--expanded' : ''}`}
    >
      <button
        type="button"
        className="entry-header"
        onClick={handleToggle}
        aria-expanded={expanded}
        aria-controls={panelId}
      >
        <span className={`chevron ${expanded ? 'chevron--expanded' : ''}`}>
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path
              d="M1 1L7 7L13 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <StatusBadge status={entry.status} hours={entry.hours} />
        <div className="entry-date">
          <span className="date-text">{entry.date}</span>
          <span className="day-name">{entry.dayName}</span>
        </div>
        <span className="calendar-icon">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <rect
              x="2"
              y="3"
              width="14"
              height="13"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path d="M2 7H16" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M6 1V4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M12 1V4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>

      {expanded && entry.timeEntries.length > 0 && (
        <div id={panelId} className="entry-content">
          <div className="time-entries-list">
            {entry.timeEntries.map((timeEntry) => (
              <TimeEntryItem
                key={timeEntry.id}
                entry={timeEntry}
                onEdit={onEditEntry}
              />
            ))}
          </div>
          <button
            className="add-report-link"
            onClick={handleAddReport}
            disabled={!onAddReport}
            aria-disabled={!onAddReport}
            title={!onAddReport ? 'תכונה זו תהיה זמינה בקרוב' : undefined}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1V13M1 7H13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>הוספת דיווח</span>
          </button>
        </div>
      )}

      {expanded && entry.timeEntries.length === 0 && (
        <div id={panelId} className="entry-content entry-content--empty">
          <button
            className="add-report-link"
            onClick={handleAddReport}
            disabled={!onAddReport}
            aria-disabled={!onAddReport}
            title={!onAddReport ? 'תכונה זו תהיה זמינה בקרוב' : undefined}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1V13M1 7H13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span>הוספת דיווח</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default DailyEntryCard;
