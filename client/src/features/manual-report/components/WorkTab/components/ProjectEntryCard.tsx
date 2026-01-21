import { ProjectEntry } from '../../../types/manualReport';
import { ProjectTimeValidationError } from '../../../utils/validation';
import { formatTime } from '../../../utils/time';
import TimePicker from './TimePicker';
import { SelectionType } from '../../../../../components/SelectionModal/SelectionModal';

// TODO: Replace with real API call before production
import { getProjectInfo } from '../../../../../mocks';

interface ProjectEntryCardProps {
  project: ProjectEntry;
  editingField: string | null;
  timeError?: ProjectTimeValidationError;
  onOpenSelection: (type: SelectionType, projectId: string) => void;
  onTimeClick: (field: string) => void;
  onDescriptionChange: (projectId: string, description: string) => void;
  onDeleteProject: (projectId: string) => void;
  getRefs: (field: string) => {
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

function ProjectEntryCard({
  project,
  editingField,
  timeError,
  onOpenSelection,
  onTimeClick,
  onDescriptionChange,
  onDeleteProject,
  getRefs,
  onScroll,
  onWheel,
  onItemClick,
}: ProjectEntryCardProps) {
  // TODO: Replace with real API call before production
  const projectInfo = project.project ? getProjectInfo(project.project) : null;

  return (
    <div className="project-entry">
      <div
        className="project-field"
        onClick={() => onOpenSelection('project', project.id)}
      >
        {projectInfo ? (
          <div className="project-pills">
            <span className="project-pill project-pill--gray">
              {projectInfo.company}
            </span>
            <span className="project-arrow">←</span>
            <span className="project-pill project-pill--blue">
              {projectInfo.project}
            </span>
          </div>
        ) : (
          <span className="field-label placeholder">בחר פרויקט</span>
        )}
        <span className="field-chevron">›</span>
      </div>

      <div
        className="project-field"
        onClick={() => onOpenSelection('task', project.id)}
      >
        <span className={`field-label ${!project.task ? 'placeholder' : ''}`}>
          {project.task || 'בחר משימה'}
        </span>
        <span className="field-chevron">›</span>
      </div>

      <div
        className="project-field"
        onClick={() => onOpenSelection('location', project.id)}
      >
        <span
          className={`field-label ${!project.location ? 'placeholder' : ''}`}
        >
          {project.location || 'בחר מיקום'}
        </span>
        <span className="field-icon">◊</span>
      </div>

      <div
        className="project-time-row"
        onClick={() => onTimeClick(`project-${project.id}-start`)}
      >
        <span className="time-label">שעת התחלה</span>
        <span className="time-value">
          {formatTime(project.startTime.hours, project.startTime.minutes)}
        </span>
      </div>

      {editingField === `project-${project.id}-start` && (
        <TimePicker
          value={project.startTime}
          refs={getRefs(`project-${project.id}-start`)}
          onScroll={onScroll}
          onWheel={onWheel}
          onItemClick={onItemClick}
        />
      )}

      <div
        className="project-time-row"
        onClick={() => onTimeClick(`project-${project.id}-end`)}
      >
        <span className="time-label">שעת סיום</span>
        <span className="time-value">
          {formatTime(project.endTime.hours, project.endTime.minutes)}
        </span>
      </div>

      {editingField === `project-${project.id}-end` && (
        <TimePicker
          value={project.endTime}
          refs={getRefs(`project-${project.id}-end`)}
          onScroll={onScroll}
          onWheel={onWheel}
          onItemClick={onItemClick}
        />
      )}

      <textarea
        className="project-description"
        placeholder="הוספת פירוט..."
        value={project.description}
        onChange={(e) => onDescriptionChange(project.id, e.target.value)}
        rows={3}
        dir="rtl"
      />

      <button
        className="delete-project-btn"
        onClick={() => onDeleteProject(project.id)}
      >
        מחיקת פרויקט
      </button>

      {timeError && (
        <div
          className="project-time-error"
          role="alert"
          data-error-code={timeError.code}
        >
          {timeError.message}
        </div>
      )}
    </div>
  );
}

export default ProjectEntryCard;
