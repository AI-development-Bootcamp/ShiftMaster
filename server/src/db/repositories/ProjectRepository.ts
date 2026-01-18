import { BaseRepository } from './BaseRepository.js';
import { IProjectRepository } from '../types/repositories.js';
import { Project, NewProject, UpdateProject } from '../types/entities.js';
import { logDbError } from '../utils/logger.js';

export class ProjectRepository extends BaseRepository<Project, NewProject, UpdateProject> implements IProjectRepository {
    constructor() {
        super('projects', 'project_id');
    }

    async findByClientId(clientId: number): Promise<Project[]> {
        const { data, error } = await this.client
            .from(this.table)
            .select('*')
            .eq('client_id', clientId)
            .order('name');

        if (error) {
            logDbError('ProjectRepository.findByClientId', error);
            throw error;
        }

        return data as Project[];
    }

    async findActive(): Promise<Project[]> {
        const { data, error } = await this.client
            .from(this.table)
            .select('*')
            .eq('active', true)
            .order('name');

        if (error) {
            logDbError('ProjectRepository.findActive', error);
            throw error;
        }

        return data as Project[];
    }
}
