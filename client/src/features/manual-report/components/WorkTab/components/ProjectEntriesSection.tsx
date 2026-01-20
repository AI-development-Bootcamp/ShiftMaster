import { ProjectEntry } from '../../../types/manualReport';
import ProjectEntryCard from './ProjectEntryCard';
import { PlusCircleIcon } from '../../icons';
import { SelectionType } from '../../../../../components/SelectionModal/SelectionModal';

interface ProjectEntriesSectionProps {
  projectEntries: ProjectEntry[];
  timeErrors: Record<string, string>;
  editingField: string | null;
  onAddProject: () => void;
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

function ProjectEntriesSection({
  projectEntries,
  timeErrors,
  editingField,
  onAddProject,
  onOpenSelection,
  onTimeClick,
  onDescriptionChange,
  onDeleteProject,
  getRefs,
  onScroll,
  onWheel,
  onItemClick,
}: ProjectEntriesSectionProps) {
  return (
    <>
      {projectEntries.length > 0 && (
        <div className="project-entries-section">
          <h3 className="section-title">דיווח פרוייקטים</h3>
          {projectEntries.map((project) => (
            <ProjectEntryCard
              key={project.id}
              project={project}
              editingField={editingField}
              timeError={timeErrors[project.id]}
              onOpenSelection={onOpenSelection}
              onTimeClick={onTimeClick}
              onDescriptionChange={onDescriptionChange}
              onDeleteProject={onDeleteProject}
              getRefs={getRefs}
              onScroll={onScroll}
              onWheel={onWheel}
              onItemClick={onItemClick}
            />
          ))}
        </div>
      )}

      <button type="button" className="add-project-btn" onClick={onAddProject}>
        <PlusCircleIcon />
        <span>הוספת פרויקט</span>
      </button>
    </>
  );
}

export default ProjectEntriesSection;
