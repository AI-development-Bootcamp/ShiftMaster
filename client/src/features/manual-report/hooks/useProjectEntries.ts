import { useState, useCallback } from 'react';
import { ProjectEntry, TimeValue } from '../types/manualReport';
import {
  validateProjectTime,
  ProjectTimeValidationError,
} from '../utils/validation';

export function useProjectEntries() {
  const [projectEntries, setProjectEntries] = useState<ProjectEntry[]>([]);
  const [timeErrors, setTimeErrors] = useState<
    Record<string, ProjectTimeValidationError>
  >({});

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

// ...existing code...

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

// ...existing code...

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