import { SupabaseClient } from '@supabase/supabase-js';
import { AdminTaskAssignmentRepository } from '../db/repositories/AdminTaskAssignmentRepository.js';
import { TaskRepository } from '../db/repositories/TaskRepository.js';
import { ProjectRepository } from '../db/repositories/ProjectRepository.js';
import { ClientRepository } from '../db/repositories/ClientRepository.js';
import type { TaskTreeProject, TaskTreeTask } from '@abra-shift-master/shared';
import type { Task, Project } from '../db/types/entities.js';

export class TaskTreeService {
  private assignmentRepo: AdminTaskAssignmentRepository;
  private taskRepo: TaskRepository;
  private projectRepo: ProjectRepository;
  private clientRepo: ClientRepository;

  constructor(client: SupabaseClient) {
    this.assignmentRepo = new AdminTaskAssignmentRepository(client);
    this.taskRepo = new TaskRepository(client);
    this.projectRepo = new ProjectRepository(client);
    this.clientRepo = new ClientRepository(client);
  }

  /**
   * Get user's task tree (projects and their assigned tasks)
   * @param userId - User ID
   * @param options - Optional filters
   * @returns Hierarchical structure of projects with assigned tasks
   */
  async getUserTaskTree(
    userId: string,
    options?: {
      includeInactive?: boolean;
      projectId?: string;
    }
  ): Promise<TaskTreeProject[]> {
    // 1. Get user's active admin task assignments
    const assignments = await this.assignmentRepo.findByUserId(userId);
    const activeAssignments = options?.includeInactive
      ? assignments
      : assignments.filter((a) => a.active);

    if (activeAssignments.length === 0) {
      return [];
    }

    // 2. Get tasks for these assignments
    const taskIds = activeAssignments.map((a) => a.task_id);
    const tasks = await this.getTasksByIds(taskIds);

    // 3. Filter by active status if needed
    const filteredTasks = options?.includeInactive ? tasks : tasks.filter((t) => t.active);

    // 4. Group tasks by project
    const projectTasksMap = this.groupTasksByProject(filteredTasks);

    // 5. Get projects and clients
    const projectIds = Array.from(projectTasksMap.keys());
    const projects = await this.getProjectsByIds(projectIds);

    // 6. Filter by projectId if specified
    const filteredProjects = options?.projectId
      ? projects.filter((p) => p.project_id === options.projectId)
      : projects;

    // 7. Build hierarchical structure
    const taskTree = await this.buildTaskTree(filteredProjects, projectTasksMap);

    return taskTree;
  }

  /**
   * Get tasks by IDs
   */
  private async getTasksByIds(taskIds: string[]): Promise<Task[]> {
    const tasks: Task[] = [];
    for (const taskId of taskIds) {
      const task = await this.taskRepo.findById(taskId);
      if (task) {
        tasks.push(task);
      }
    }
    return tasks;
  }

  /**
   * Get projects by IDs
   */
  private async getProjectsByIds(projectIds: string[]): Promise<Project[]> {
    const projects: Project[] = [];
    for (const projectId of projectIds) {
      const project = await this.projectRepo.findById(projectId);
      if (project) {
        projects.push(project);
      }
    }
    return projects;
  }

  /**
   * Group tasks by project ID
   */
  private groupTasksByProject(tasks: Task[]): Map<string, Task[]> {
    const map = new Map<string, Task[]>();

    for (const task of tasks) {
      const projectTasks = map.get(task.project_id) || [];
      projectTasks.push(task);
      map.set(task.project_id, projectTasks);
    }

    return map;
  }

  /**
   * Build hierarchical task tree structure
   */
  private async buildTaskTree(
    projects: Project[],
    projectTasksMap: Map<string, Task[]>
  ): Promise<TaskTreeProject[]> {
    const taskTree: TaskTreeProject[] = [];

    for (const project of projects) {
      // Get client info
      const client = await this.clientRepo.findById(project.client_id);

      // Get tasks for this project
      const tasks = projectTasksMap.get(project.project_id) || [];

      // Transform tasks
      const taskTreeTasks: TaskTreeTask[] = tasks.map((task) => ({
        task_id: task.task_id,
        task_name: task.name,
        task_description: task.description,
        start_date: task.start_date,
        end_date: task.end_date,
        active: task.active,
      }));

      // Build project node
      const projectNode: TaskTreeProject = {
        project_id: project.project_id,
        project_name: project.name,
        client_id: project.client_id,
        client_name: client?.name || 'Unknown Client',
        time_format_type: project.time_format_type,
        active: project.active,
        tasks: taskTreeTasks,
      };

      taskTree.push(projectNode);
    }

    return taskTree;
  }
}
