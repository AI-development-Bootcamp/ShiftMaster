import '../../styles/TimeEntryItem.css';

export interface TimeEntry {
  id: string;
  projectName: string;
  startTime: string;
  endTime: string;
  hours: string;
}

interface TimeEntryItemProps {
  entry: TimeEntry;
  onEdit?: (id: string) => void;
}

function TimeEntryItem({ entry, onEdit }: TimeEntryItemProps) {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(entry.id);
    }
  };

  return (
    <div className="time-entry-item">
      <button
        type="button"
        className="edit-btn"
        onClick={handleEdit}
        disabled={!onEdit}
        aria-disabled={!onEdit}
        title={!onEdit ? 'תכונה זו תהיה זמינה בקרוב' : undefined}
      >
        <svg
          className="edit-icon"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path
            d="M10.5 1.5L12.5 3.5L4.5 11.5L1.5 12.5L2.5 9.5L10.5 1.5Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>עריכה</span>
      </button>
      <div className="entry-hours">{entry.hours} ש&apos;</div>
      <div className="entry-time-range">
        {entry.startTime}-{entry.endTime}
      </div>
      <div className="entry-project">{entry.projectName}</div>
    </div>
  );
}

export default TimeEntryItem;
