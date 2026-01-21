import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProjectEntries } from '../../../../features/manual-report/hooks/useProjectEntries';
import { TimeValue } from '../../../../features/manual-report/types/manualReport';

describe('useProjectEntries', () => {
  beforeEach(() => {
    // Reset hook state between tests
  });

  describe('Initial State', () => {
    it('should start with empty project entries', () => {
      const { result } = renderHook(() => useProjectEntries());
      expect(result.current.projectEntries).toEqual([]);
    });

    it('should start with empty time errors', () => {
      const { result } = renderHook(() => useProjectEntries());
      expect(result.current.timeErrors).toEqual({});
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useProjectEntries());
      expect(typeof result.current.addProject).toBe('function');
      expect(typeof result.current.updateProjectDescription).toBe('function');
      expect(typeof result.current.updateProjectField).toBe('function');
      expect(typeof result.current.updateProjectTime).toBe('function');
      expect(typeof result.current.deleteProject).toBe('function');
    });
  });

  describe('addProject', () => {
    it('should add a new project entry', () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      expect(result.current.projectEntries).toHaveLength(1);
    });

    it('should add project with default values', () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      const project = result.current.projectEntries[0];
      expect(project).toHaveProperty('id');
      expect(project.project).toBe('');
      expect(project.task).toBe('');
      expect(project.location).toBe('');
      expect(project.description).toBe('');
    });

    it('should add project with default time values', () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      const project = result.current.projectEntries[0];
      expect(project.startTime).toEqual({
        hours: 9,
        minutes: 0,
        period: 'AM',
      });
      expect(project.endTime).toEqual({ hours: 5, minutes: 0, period: 'PM' });
    });

    it('should add multiple projects with unique IDs', async () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      // Wait 1ms to ensure different timestamp
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1));
      });

      act(() => {
        result.current.addProject();
      });

      expect(result.current.projectEntries).toHaveLength(2);
      expect(result.current.projectEntries[0].id).not.toBe(
        result.current.projectEntries[1].id
      );
    });
  });

  describe('updateProjectDescription', () => {
    it('should update project description', () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      const projectId = result.current.projectEntries[0].id;

      act(() => {
        result.current.updateProjectDescription(projectId, 'New description');
      });

      expect(result.current.projectEntries[0].description).toBe(
        'New description'
      );
    });

    it('should not update other project properties', () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      const projectId = result.current.projectEntries[0].id;
      const originalProject = { ...result.current.projectEntries[0] };

      act(() => {
        result.current.updateProjectDescription(projectId, 'New description');
      });

      const updatedProject = result.current.projectEntries[0];
      expect(updatedProject.project).toBe(originalProject.project);
      expect(updatedProject.task).toBe(originalProject.task);
      expect(updatedProject.location).toBe(originalProject.location);
    });

    it('should not affect other projects', async () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      // Wait to ensure different timestamp
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1));
      });

      act(() => {
        result.current.addProject();
      });

      const firstProjectId = result.current.projectEntries[0].id;

      act(() => {
        result.current.updateProjectDescription(
          firstProjectId,
          'First project'
        );
      });

      expect(result.current.projectEntries[0].description).toBe(
        'First project'
      );
      expect(result.current.projectEntries[1].description).toBe('');
    });
  });

  describe('updateProjectField', () => {
    it('should update project field', () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      const projectId = result.current.projectEntries[0].id;

      act(() => {
        result.current.updateProjectField(projectId, 'project', 'Project A');
      });

      expect(result.current.projectEntries[0].project).toBe('Project A');
    });

    it('should update task field', () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      const projectId = result.current.projectEntries[0].id;

      act(() => {
        result.current.updateProjectField(projectId, 'task', 'Development');
      });

      expect(result.current.projectEntries[0].task).toBe('Development');
    });

    it('should update location field', () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      const projectId = result.current.projectEntries[0].id;

      act(() => {
        result.current.updateProjectField(projectId, 'location', 'Office');
      });

      expect(result.current.projectEntries[0].location).toBe('Office');
    });
  });

  describe('updateProjectTime', () => {
    it('should update start time', () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      const projectId = result.current.projectEntries[0].id;
      const newTime: TimeValue = { hours: 10, minutes: 30, period: 'AM' };

      act(() => {
        result.current.updateProjectTime(projectId, 'startTime', newTime);
      });

      expect(result.current.projectEntries[0].startTime).toEqual(newTime);
    });

    it('should update end time', () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      const projectId = result.current.projectEntries[0].id;
      const newTime: TimeValue = { hours: 6, minutes: 0, period: 'PM' };

      act(() => {
        result.current.updateProjectTime(projectId, 'endTime', newTime);
      });

      expect(result.current.projectEntries[0].endTime).toEqual(newTime);
    });

    it('should set error when end time is before start time', async () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      const projectId = result.current.projectEntries[0].id;
      const invalidEndTime: TimeValue = { hours: 8, minutes: 0, period: 'AM' };

      act(() => {
        result.current.updateProjectTime(projectId, 'endTime', invalidEndTime);
      });

      // Wait for async validation
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(result.current.timeErrors[projectId]).toBeDefined();
      expect(result.current.timeErrors[projectId]?.code).toBe(
        'END_TIME_NOT_AFTER_START'
      );
    });

    it('should clear error when time is corrected', async () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      const projectId = result.current.projectEntries[0].id;

      // First set invalid time
      act(() => {
        const invalidEndTime: TimeValue = {
          hours: 8,
          minutes: 0,
          period: 'AM',
        };
        result.current.updateProjectTime(projectId, 'endTime', invalidEndTime);
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      // Then correct it
      act(() => {
        const validEndTime: TimeValue = { hours: 6, minutes: 0, period: 'PM' };
        result.current.updateProjectTime(projectId, 'endTime', validEndTime);
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(result.current.timeErrors[projectId]).toBeUndefined();
    });
  });

  describe('deleteProject', () => {
    it('should delete a project entry', () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      const projectId = result.current.projectEntries[0].id;

      act(() => {
        result.current.deleteProject(projectId);
      });

      expect(result.current.projectEntries).toHaveLength(0);
    });

    it('should delete correct project when multiple exist', async () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      // Wait to ensure different timestamp
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1));
      });

      act(() => {
        result.current.addProject();
      });

      const firstProjectId = result.current.projectEntries[0].id;
      const secondProjectId = result.current.projectEntries[1].id;

      act(() => {
        result.current.updateProjectField(firstProjectId, 'project', 'First');
        result.current.updateProjectField(
          secondProjectId,
          'project',
          'Second'
        );
      });

      act(() => {
        result.current.deleteProject(firstProjectId);
      });

      expect(result.current.projectEntries).toHaveLength(1);
      expect(result.current.projectEntries[0].project).toBe('Second');
    });

    it('should remove associated time errors when deleting project', async () => {
      const { result } = renderHook(() => useProjectEntries());

      act(() => {
        result.current.addProject();
      });

      const projectId = result.current.projectEntries[0].id;

      // Set invalid time to create error
      act(() => {
        const invalidEndTime: TimeValue = {
          hours: 8,
          minutes: 0,
          period: 'AM',
        };
        result.current.updateProjectTime(projectId, 'endTime', invalidEndTime);
      });

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });

      expect(result.current.timeErrors[projectId]).toBeDefined();

      // Delete project
      act(() => {
        result.current.deleteProject(projectId);
      });

      expect(result.current.timeErrors[projectId]).toBeUndefined();
    });
  });
});
