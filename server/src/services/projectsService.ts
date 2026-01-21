
import { SupabaseClient } from '@supabase/supabase-js';
import { ProjectRepository } from '../db/repositories/ProjectRepository.js';
import { Project } from '../db/types/entities.js';

export class ProjectsService {
    private projectRepo: ProjectRepository;

    constructor(client: SupabaseClient) {
        this.projectRepo = new ProjectRepository(client);
    }

    async listProjects(): Promise<Project[]> {
        return this.projectRepo.findActive();
    }
}
