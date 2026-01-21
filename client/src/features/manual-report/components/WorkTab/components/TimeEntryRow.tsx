import { TimeValue } from '../../../types/manualReport';
import { formatTime } from '../../../utils/time';
import TimePicker from './TimePicker';

interface TimeEntryRowProps {
  label: string;
  value: TimeValue;
  isEditing: boolean;
  onTimeClick: () => void;
  refs: {
    hours: React.RefObject<HTMLDivElement>;
    minutes: React.RefObject<HTMLDivElement>;
    period: React.RefObject<HTMLDivElement>;
  };
  onScroll: (
    ref: React.RefObject<HTMLDivElement>,
    items: (number | 'AM' | 'PM')[],
    field: 'hours' | 'minutes' | 'period'
  ) => void;
  onWheel: (
    e: React.WheelEvent<HTMLDivElement>,
    ref: React.RefObject<HTMLDivElement>,
    items: (number | 'AM' | 'PM')[]
  ) => void;
  onItemClick: (
    ref: React.RefObject<HTMLDivElement>,
    itemIndex: number
  ) => void;
}

function TimeEntryRow({
  label,
  value,
  isEditing,
  onTimeClick,
  refs,
  onScroll,
  onWheel,
  onItemClick,
}: TimeEntryRowProps) {
  return (
    <>
      <div className="time-entry-row" onClick={onTimeClick}>
        <span className="time-label">{label}</span>
        <span className="time-value">
          {formatTime(value.hours, value.minutes)}
        </span>
      </div>

      {isEditing && (
        <TimePicker
          value={value}
          refs={refs}
          onScroll={onScroll}
          onWheel={onWheel}
          onItemClick={onItemClick}
        />
      )}
    </>
  );
}

export default TimeEntryRow;
