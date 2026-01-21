import { useState, useCallback, useEffect } from 'react';
import { ProjectEntry, TimeValue } from '../types/manualReport';
import {
  validateProjectTime,
  ProjectTimeValidationError,
} from '../utils/validation';

interface InitialProject {
  id: string;
  project: string;
  task: string;
  location: string;
  startTime: string;
  endTime: string;
  description?: string;
}

// Helper function to convert time string (e.g., "09:00", "14:30") to TimeValue
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

interface UseProjectEntriesOptions {
  initialProjects?: InitialProject[] | null;
}

export function useProjectEntries(options: UseProjectEntriesOptions = {}) {
  const { initialProjects } = options;

  const [projectEntries, setProjectEntries] = useState<ProjectEntry[]>([]);
  const [timeErrors, setTimeErrors] = useState<
    Record<string, ProjectTimeValidationError>
  >({});

  // Initialize with projects data if provided
  useEffect(() => {
    if (initialProjects && initialProjects.length > 0) {
      const entries: ProjectEntry[] = initialProjects.map((initialProject) => ({
        id: initialProject.id,
        project: initialProject.project,
        task: initialProject.task,
        location: initialProject.location,
        startTime: parseTimeString(initialProject.startTime),
        endTime: parseTimeString(initialProject.endTime),
        description: initialProject.description || '',
      }));
      setProjectEntries(entries);
    }
  }, [initialProjects]);

  const addProject = useCallback(() => {
    const newProject: ProjectEntry = {
      id: Date.now().toString(),
      project: '',
      task: '',
      location: '',
      startTime: { hours: 9, minutes: 0, period: 'AM' },
      endTime: { hours: 5, minutes: 0, period: 'PM' },
      description: '',
    };
    setProjectEntries((prev) => [...prev, newProject]);
  }, []);

  const updateProjectDescription = useCallback(
    (projectId: string, description: string) => {
      setProjectEntries((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, description } : p))
      );
    },
    []
  );

  const updateProjectField = useCallback(
    (projectId: string, field: string, value: string) => {
      setProjectEntries((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, [field]: value } : p))
      );
    },
    []
  );

  const updateProjectTime = useCallback(
    (projectId: string, field: 'startTime' | 'endTime', newTime: TimeValue) => {
      setProjectEntries((prev) =>
        prev.map((p) => {
          if (p.id === projectId) {
            const updatedProject = { ...p, [field]: newTime };

            setTimeout(() => {
              const error = validateProjectTime(
                updatedProject.startTime,
                updatedProject.endTime
              );

              setTimeErrors((prevErrors) => {
                const newErrors = { ...prevErrors };
                if (error) {
                  newErrors[projectId] = error;
                } else {
                  delete newErrors[projectId];
                }
                return newErrors;
              });
            }, 0);

            return updatedProject;
          }
          return p;
        })
      );
    },
    []
  );

  const deleteProject = useCallback((projectId: string) => {
    setProjectEntries((prev) => prev.filter((p) => p.id !== projectId));
    setTimeErrors((prev) => {
      const { [projectId]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  return {
    projectEntries,
    timeErrors,
    addProject,
    updateProjectDescription,
    updateProjectField,
    updateProjectTime,
    deleteProject,
  };
}