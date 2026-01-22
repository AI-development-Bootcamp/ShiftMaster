import { SupabaseClient } from '@supabase/supabase-js';
import { EntryRepository } from '../db/repositories/EntryRepository.js';
import { EntryAssignmentRepository } from '../db/repositories/EntryAssignmentRepository.js';
import { TaskRepository } from '../db/repositories/TaskRepository.js';
import { ProjectRepository } from '../db/repositories/ProjectRepository.js';
import { MonthLockService } from './monthLockService.js';
import { TaskAssignmentVerificationService } from './taskAssignmentVerification.js';
import { TimeFormatValidationService } from './timeFormatValidation.js';
import type { Entry, NewEntry, NewEntryAssignment, Task, Project } from '../db/types/entities.js';
import type {
  CreateWorkEntryRequest,
  WorkEntryResponse,
  EntryAssignmentResponse,
} from '@abra-shift-master/shared';

export class EntriesService {
  private entryRepo: EntryRepository;
  private assignmentRepo: EntryAssignmentRepository;
  private taskRepo: TaskRepository;
  private projectRepo: ProjectRepository;
  private monthLockService: MonthLockService;
  private taskAssignmentVerification: TaskAssignmentVerificationService;
  private timeFormatValidation: TimeFormatValidationService;

  constructor(client: SupabaseClient) {
    this.entryRepo = new EntryRepository(client);
    this.assignmentRepo = new EntryAssignmentRepository(client);
    this.taskRepo = new TaskRepository(client);
    this.projectRepo = new ProjectRepository(client);
    this.monthLockService = new MonthLockService(client);
    this.taskAssignmentVerification = new TaskAssignmentVerificationService(client);
    this.timeFormatValidation = new TimeFormatValidationService();
  }

  /**
   * Create a work entry with task assignments
   * Implements upsert logic: updates existing entry if one exists for the date
   * @param userId - User ID creating the entry
   * @param entryData - Work entry data with assignments
   * @returns Created entry with assignments and joined data
   */
  async createWorkEntry(userId: string, entryData: CreateWorkEntryRequest): Promise<WorkEntryResponse> {
    // 1. Check month is not locked
    await this.monthLockService.checkLocked(entryData.work_date);

    // 2. Verify user is assigned to all tasks
    const taskIds = entryData.assignments.map((assignment) => assignment.task_id);
    await this.taskAssignmentVerification.verifyUserAssignedToTasks(userId, taskIds);

    // 3. Fetch tasks and projects to validate time formats
    const taskProjectMap = await this.getTaskProjectMap(taskIds);

    // 4. Validate time formats for each assignment
    for (const assignment of entryData.assignments) {
      const { project } = taskProjectMap.get(assignment.task_id)!;
      this.timeFormatValidation.validateAssignmentTimeFormat(
        assignment,
        project.time_format_type,
        project.project_id,
        project.name
      );
    }

    // 5. Check for existing entry (upsert logic)
    const existingEntries = await this.entryRepo.findByUserIdAndDate(userId, entryData.work_date);
    const existingEntry = existingEntries.find((e) => e.entry_kind === 'work');

    let entry: Entry;

    if (existingEntry) {
      // Update existing entry
      entry = await this.updateExistingEntry(existingEntry.entry_id, userId, entryData);
    } else {
      // Create new entry
      entry = await this.createNewEntry(userId, entryData);
    }

    // 6. Return entry with assignments and joined data
    return this.getEntryWithAssignments(entry.entry_id);
  }

  /**
   * Get entries for a user within a date range
   * @param userId - User ID
   * @param startDate - Start date (YYYY-MM-DD)
   * @param endDate - End date (YYYY-MM-DD)
   * @returns Array of work entries with assignments
   */
  async getEntriesByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<WorkEntryResponse[]> {
    const entries = await this.entryRepo.findByUserIdAndDateRange(userId, startDate, endDate);
    const workEntries = entries.filter((e) => e.entry_kind === 'work');

    // Fetch assignments for all entries
    const entriesWithAssignments = await Promise.all(
      workEntries.map((entry) => this.getEntryWithAssignments(entry.entry_id))
    );

    return entriesWithAssignments;
  }

  /**
   * Create a new work entry with assignments
   */
  private async createNewEntry(userId: string, entryData: CreateWorkEntryRequest): Promise<Entry> {
    // Create entry
    const newEntry: NewEntry = {
      user_id: userId,
      entry_kind: 'work',
      work_date: entryData.work_date,
      start_time: entryData.start_time || null,
      end_time: entryData.end_time || null,
      description: entryData.description || null,
      absence_type: null,
      last_modified_by: userId,
    };

    const entry = await this.entryRepo.create(newEntry);

    // Create assignments
    await this.createAssignments(entry.entry_id, entryData.assignments);

    return entry;
  }

  /**
   * Update an existing entry with new data
   */
  private async updateExistingEntry(
    entryId: string,
    userId: string,
    entryData: CreateWorkEntryRequest
  ): Promise<Entry> {
    // Update entry
    const entry = await this.entryRepo.update(entryId, {
      start_time: entryData.start_time || null,
      end_time: entryData.end_time || null,
      description: entryData.description || null,
      last_modified_by: userId,
      last_modified_at: new Date().toISOString(),
    });

    // Delete existing assignments and create new ones
    // Note: This is a simple approach. In production, you might want to diff and update
    const existingAssignments = await this.assignmentRepo.findByEntryId(entryId);
    for (const assignment of existingAssignments) {
      await this.assignmentRepo.delete(assignment.entry_assignment_id);
    }

    await this.createAssignments(entryId, entryData.assignments);

    return entry;
  }

  /**
   * Create assignments for an entry
   */
  private async createAssignments(
    entryId: string,
    assignments: CreateWorkEntryRequest['assignments']
  ): Promise<void> {
    for (const assignment of assignments) {
      const newAssignment: NewEntryAssignment = {
        entry_id: entryId,
        task_id: assignment.task_id,
        location: assignment.location as 'Office' | 'Client' | 'Home',
        start_time: assignment.start_time || null,
        end_time: assignment.end_time || null,
        duration_minutes: assignment.duration_minutes || null,
      };

      await this.assignmentRepo.create(newAssignment);
    }
  }

  /**
   * Get entry with assignments and joined task/project data
   */
  private async getEntryWithAssignments(entryId: string): Promise<WorkEntryResponse> {
    const entry = await this.entryRepo.findById(entryId);
    if (!entry) {
      throw new Error(`Entry ${entryId} not found`);
    }

    const assignments = await this.assignmentRepo.findByEntryId(entryId);

    // Join task and project data for each assignment
    const assignmentsWithJoins: EntryAssignmentResponse[] = await Promise.all(
      assignments.map(async (assignment) => {
        const task = await this.taskRepo.findById(assignment.task_id);
        const project = task ? await this.projectRepo.findById(task.project_id) : null;

        return {
          entry_assignment_id: assignment.entry_assignment_id,
          entry_id: assignment.entry_id,
          task_id: assignment.task_id,
          task_name: task?.name || 'Unknown',
          project_id: task?.project_id || '',
          project_name: project?.name || 'Unknown',
          location: assignment.location,
          start_time: assignment.start_time,
          end_time: assignment.end_time,
          duration_minutes: assignment.duration_minutes,
          created_at: assignment.created_at,
          updated_at: assignment.updated_at,
        };
      })
    );

    return {
      entry_id: entry.entry_id,
      user_id: entry.user_id,
      entry_kind: 'work',
      work_date: entry.work_date,
      start_time: entry.start_time,
      end_time: entry.end_time,
      description: entry.description,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      last_modified_by: entry.last_modified_by,
      last_modified_at: entry.last_modified_at,
      assignments: assignmentsWithJoins,
    };
  }

  /**
   * Get task and project data for validation
   */
  private async getTaskProjectMap(
    taskIds: string[]
  ): Promise<Map<string, { task: Task; project: Project }>> {
    const map = new Map<string, { task: Task; project: Project }>();

    for (const taskId of taskIds) {
      const task = await this.taskRepo.findById(taskId);
      if (!task) {
        throw new Error(`Task ${taskId} not found`);
      }

      const project = await this.projectRepo.findById(task.project_id);
      if (!project) {
        throw new Error(`Project ${task.project_id} not found`);
      }

      map.set(taskId, { task, project });
    }

    return map;
  }
}
