import { useState, useRef, useEffect } from 'react';
import { TimeValue } from '../../types/manualReport';
import { formatDateDisplay } from '../../utils/date';
import { DAILY_QUOTA_HOURS } from '../../constants/time';
import { timeToMinutes } from '../../utils/time';
import { useTimePicker, useProjectEntries } from '../../hooks';
import { TimeEntryRow, ProjectEntriesSection } from './components';
import { InfoCircleIcon } from '../icons';
import SelectionModal, {
  SelectionType,
  SelectionGroup,
} from '../../../../components/SelectionModal/SelectionModal';

interface WorkTabProps {
  selectedDate: Date;
  projectGroups: SelectionGroup[];
  taskGroups: SelectionGroup[];
  locationGroups: SelectionGroup[];
  onRequestDeleteProject: (
    projectId: string,
    actualDeleteFn: (projectId: string) => void
  ) => void;
  onUpdateTotalHours: (hours: number) => void;
  initialTimeBlock?: {
    entryTime: string;
    exitTime: string;
    projects: Array<{
      id: string;
      project: string;
      task: string;
      location: string;
      startTime: string;
      endTime: string;
      description?: string;
    }>;
  } | null;
}

function WorkTab({
  selectedDate,
  projectGroups,
  taskGroups,
  locationGroups,
  onRequestDeleteProject,
  onUpdateTotalHours,
  initialTimeBlock,
}: WorkTabProps) {
  // Helper to parse time string to TimeValue
  const parseTimeString = (timeStr: string): TimeValue => {
    const [hoursStr, minutesStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const period: 'AM' | 'PM' = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    if (hours > 12) {
      hours -= 12;
    } else if (hours === 0) {
      hours = 12;
    }

    return { hours, minutes, period };
  };

  const [editingField, setEditingField] = useState<
    'entry' | 'exit' | string | null
  >(null);
  const [entryTime, setEntryTime] = useState<TimeValue>(
    initialTimeBlock?.entryTime
      ? parseTimeString(initialTimeBlock.entryTime)
      : { hours: 9, minutes: 0, period: 'AM' }
  );
  const [exitTime, setExitTime] = useState<TimeValue>(
    initialTimeBlock?.exitTime
      ? parseTimeString(initialTimeBlock.exitTime)
      : { hours: 5, minutes: 0, period: 'PM' }
  );
  const [selectionModal, setSelectionModal] = useState<{
    isOpen: boolean;
    type: SelectionType | null;
    projectId: string | null;
  }>({
    isOpen: false,
    type: null,
    projectId: null,
  });

  const entryHoursRef = useRef<HTMLDivElement>(null);
  const entryMinutesRef = useRef<HTMLDivElement>(null);
  const entryPeriodRef = useRef<HTMLDivElement>(null);
  const exitHoursRef = useRef<HTMLDivElement>(null);
  const exitMinutesRef = useRef<HTMLDivElement>(null);
  const exitPeriodRef = useRef<HTMLDivElement>(null);

  const {
    projectEntries,
    timeErrors,
    addProject,
    updateProjectDescription,
    updateProjectField,
    updateProjectTime,
    deleteProject,
  } = useProjectEntries({
    initialProjects: initialTimeBlock?.projects || null
  });

  // Calculate total hours based on entry/exit time
  useEffect(() => {
    try {
      const entryMinutes = timeToMinutes(entryTime);
      const exitMinutes = timeToMinutes(exitTime);
      const totalHours = (exitMinutes - entryMinutes) / 60;
      onUpdateTotalHours(Math.max(0, totalHours));
    } catch {
      // If times are invalid, set to 0
      onUpdateTotalHours(0);
    }
  }, [entryTime, exitTime, onUpdateTotalHours]);

  const handleDeleteProject = (projectId: string) => {
    onRequestDeleteProject(projectId, deleteProject);
  };

  const getCurrentTime = (): TimeValue => {
    if (editingField === 'entry') return entryTime;
    if (editingField === 'exit') return exitTime;
    if (
      typeof editingField === 'string' &&
      editingField.startsWith('project-')
    ) {
      const [, projectId, field] = editingField.split('-');
      const project = projectEntries.find((p) => p.id === projectId);
      if (project) {
        return field === 'start' ? project.startTime : project.endTime;
      }
    }
    return entryTime;
  };

  const setCurrentTime = (newTime: TimeValue) => {
    if (editingField === 'entry') {
      setEntryTime(newTime);
    } else if (editingField === 'exit') {
      setExitTime(newTime);
    } else if (
      typeof editingField === 'string' &&
      editingField.startsWith('project-')
    ) {
      const [, projectId, field] = editingField.split('-');
      updateProjectTime(
        projectId,
        field === 'start' ? 'startTime' : 'endTime',
        newTime
      );
    }
  };

  const { getRefs, handleScroll, handleWheel, handleItemClick } =
    useTimePicker({
      currentTime: getCurrentTime(),
      setCurrentTime,
      editingField,
    });

  const getEntryExitRefs = (field: 'entry' | 'exit') => {
    if (field === 'entry') {
      return {
        hours: entryHoursRef,
        minutes: entryMinutesRef,
        period: entryPeriodRef,
      };
    }
    return {
      hours: exitHoursRef,
      minutes: exitMinutesRef,
      period: exitPeriodRef,
    };
  };

  const handleTimeClick = (field: 'entry' | 'exit' | string) => {
    setEditingField(editingField === field ? null : field);
  };

  const handleOpenSelection = (type: SelectionType, projectId: string) => {
    setSelectionModal({ isOpen: true, type, projectId });
  };

  const handleCloseSelection = () => {
    setSelectionModal({ isOpen: false, type: null, projectId: null });
  };

  const handleSelection = (value: string) => {
    if (!selectionModal.projectId || !selectionModal.type) return;

    updateProjectField(
      selectionModal.projectId,
      selectionModal.type,
      value
    );
  };

  const getSelectionGroups = (): SelectionGroup[] => {
    switch (selectionModal.type) {
      case 'project':
        return projectGroups;
      case 'task':
        return taskGroups;
      case 'location':
        return locationGroups;
      default:
        return [];
    }
  };

  return (
    <>
      <div className="info-row">
        <div className="date-display">{formatDateDisplay(selectedDate)}</div>
        <div className="daily-quota">
          <InfoCircleIcon />
          <span>תקן יומי {DAILY_QUOTA_HOURS} שעות</span>
        </div>
      </div>

      <div className="time-entries">
        <TimeEntryRow
          label="כניסה"
          value={entryTime}
          isEditing={editingField === 'entry'}
          onTimeClick={() => handleTimeClick('entry')}
          refs={getEntryExitRefs('entry')}
          onScroll={handleScroll}
          onWheel={handleWheel}
          onItemClick={handleItemClick}
        />

        <TimeEntryRow
          label="יציאה"
          value={exitTime}
          isEditing={editingField === 'exit'}
          onTimeClick={() => handleTimeClick('exit')}
          refs={getEntryExitRefs('exit')}
          onScroll={handleScroll}
          onWheel={handleWheel}
          onItemClick={handleItemClick}
        />
      </div>

      <ProjectEntriesSection
        projectEntries={projectEntries}
        timeErrors={timeErrors}
        editingField={editingField}
        onAddProject={addProject}
        onOpenSelection={handleOpenSelection}
        onTimeClick={handleTimeClick}
        onDescriptionChange={updateProjectDescription}
        onDeleteProject={handleDeleteProject}
        getRefs={getRefs}
        onScroll={handleScroll}
        onWheel={handleWheel}
        onItemClick={handleItemClick}
      />

      <SelectionModal
        isOpen={selectionModal.isOpen}
        onClose={handleCloseSelection}
        type={selectionModal.type || 'project'}
        groups={getSelectionGroups()}
        onSelect={handleSelection}
      />
    </>
  );
}

export default WorkTab;
