
import { SupabaseClient } from '@supabase/supabase-js';
import { TaskRepository } from '../db/repositories/TaskRepository.js';
import { Task } from '../db/types/entities.js';

export class TasksService {
    private taskRepo: TaskRepository;

    constructor(client: SupabaseClient) {
        this.taskRepo = new TaskRepository(client);
    }

    async listTasks(): Promise<Task[]> {
        return this.taskRepo.findActive();
    }
}
