import { ProjectTimeFormatType } from '../enums';

// Task tree types for user's assigned tasks
export interface TaskTreeTask {
  task_id: string;
  task_name: string;
  task_description: string | null;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
}

export interface TaskTreeProject {
  project_id: string;
  project_name: string;
  client_id: string;
  client_name: string;
  time_format_type: ProjectTimeFormatType | 'sum' | 'start_end';
  active: boolean;
  tasks: TaskTreeTask[];
}

export interface GetTaskTreeQuery {
  includeInactive?: boolean;
  projectId?: string;
}

export interface GetTaskTreeResponse {
  success: true;
  data: {
    projects: TaskTreeProject[];
  };
}

// Force this file to be treated as a module
export {};
