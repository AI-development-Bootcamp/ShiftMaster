import '../../styles/TimeEntryItem.css';

export interface TimeEntry {
  id: string;
  project: string;
  task: string;
  location: string;
  startTime: string;
  endTime: string;
  hours: number;
  description?: string;
}

interface TimeEntryItemProps {
  entry: TimeEntry;
}

function TimeEntryItem({ entry }: TimeEntryItemProps) {
  return (
    <div className="time-entry-item">
      <div className="entry-hours">{entry.hours} ש&apos;</div>
      <div className="entry-time-range">
        {entry.startTime}-{entry.endTime}
      </div>
      <div className="entry-project">{entry.project}</div>
    </div>
  );
}

export default TimeEntryItem;
