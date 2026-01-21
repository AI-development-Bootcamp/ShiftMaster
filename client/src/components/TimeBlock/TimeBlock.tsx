import { TimeBlock as TimeBlockType, ProjectAllocation } from '../../mocks/dailyEntries';
import '../../styles/TimeBlock.css';

interface TimeBlockProps {
  timeBlock: TimeBlockType;
  onEdit?: (timeBlockId: string) => void;
}

// Calculate hours from time strings
const calculateHours = (startTime: string, endTime: string): string => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const diffMinutes = endMinutes - startMinutes;

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

function TimeBlock({ timeBlock, onEdit }: TimeBlockProps) {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(timeBlock.id);
    }
  };

  return (
    <div className="time-block">
      <div className="time-block-header">
        <button
          type="button"
          className="time-block-edit-btn"
          onClick={handleEdit}
          disabled={!onEdit}
          aria-disabled={!onEdit}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
        <div className="time-block-range">
          {timeBlock.entryTime}-{timeBlock.exitTime}
        </div>
      </div>

      <div className="time-block-projects">
        {timeBlock.projects.map((project: ProjectAllocation) => (
          <div key={project.id} className="project-allocation">
            <div className="project-hours">
              {calculateHours(project.startTime, project.endTime)} ש'
            </div>
            <div className="project-name">{project.project}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TimeBlock;
