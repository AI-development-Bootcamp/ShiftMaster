import { BaseRepository } from './BaseRepository.js';
import { ITaskRepository } from '../types/repositories.js';
import { Task, NewTask, UpdateTask } from '../types/entities.js';
import { logDbError } from '../utils/logger.js';

import { SupabaseClient } from '@supabase/supabase-js';

export class TaskRepository extends BaseRepository<Task, NewTask, UpdateTask> implements ITaskRepository {
    constructor(client: SupabaseClient) {
        super('tasks', 'task_id', client);
    }

    async findByProjectId(projectId: string): Promise<Task[]> {
        const { data, error } = await this.dbConnection
            .from(this.table)
            .select('*')
            .eq('project_id', projectId)
            .order('name');

        if (error) {
            logDbError('TaskRepository.findByProjectId', error);
            throw error;
        }

        return data as Task[];
    }
}
