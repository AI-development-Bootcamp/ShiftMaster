import { SupabaseClient } from '@supabase/supabase-js';
import { AdminTaskAssignmentRepository } from '../db/repositories/AdminTaskAssignmentRepository.js';
import { TaskRepository } from '../db/repositories/TaskRepository.js';
import { EntryErrorCode } from '@abra-shift-master/shared';

export class TaskNotAssignedError extends Error {
  code = EntryErrorCode.TASK_NOT_ASSIGNED;
  details: {
    task_id: string;
    task_name: string;
    user_id: string;
  };

  constructor(userId: string, taskId: string, taskName: string) {
    super(`User ${userId} is not assigned to task ${taskId} (${taskName})`);
    this.name = 'TaskNotAssignedError';
    this.details = {
      task_id: taskId,
      task_name: taskName,
      user_id: userId,
    };
  }
}

export class TaskNotFoundError extends Error {
  code = EntryErrorCode.TASK_NOT_FOUND;

  constructor(taskId: string) {
    super(`Task with ID ${taskId} not found`);
    this.name = 'TaskNotFoundError';
  }
}

export class TaskInactiveError extends Error {
  code = EntryErrorCode.TASK_INACTIVE;

  constructor(taskId: string, taskName: string) {
    super(`Task ${taskId} (${taskName}) is inactive and cannot be used`);
    this.name = 'TaskInactiveError';
  }
}

export class TaskAssignmentVerificationService {
  private assignmentRepo: AdminTaskAssignmentRepository;
  private taskRepo: TaskRepository;

  constructor(client: SupabaseClient) {
    this.assignmentRepo = new AdminTaskAssignmentRepository(client);
    this.taskRepo = new TaskRepository(client);
  }

  /**
   * Verify that a user is assigned to all provided task IDs
   * @param userId - User ID to check assignments for
   * @param taskIds - Array of task IDs to verify
   * @throws {TaskNotFoundError} If any task doesn't exist
   * @throws {TaskInactiveError} If any task is inactive
   * @throws {TaskNotAssignedError} If user is not assigned to any task
   */
  async verifyUserAssignedToTasks(userId: string, taskIds: string[]): Promise<void> {
    if (!taskIds || taskIds.length === 0) {
      throw new Error('Task IDs array cannot be empty');
    }

    for (const taskId of taskIds) {
      // Check if task exists
      const task = await this.taskRepo.findById(taskId);
      if (!task) {
        throw new TaskNotFoundError(taskId);
      }

      // Check if task is active
      if (!task.active) {
        throw new TaskInactiveError(taskId, task.name);
      }

      // Check if user has active assignment to this task
      const assignments = await this.assignmentRepo.findByTaskId(taskId);
      const userAssignment = assignments.find(
        (a) => a.user_id === userId && a.active
      );

      if (!userAssignment) {
        throw new TaskNotAssignedError(userId, taskId, task.name);
      }
    }
  }
}
