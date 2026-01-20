import { BaseRepository } from './BaseRepository.js';
import { IProjectRepository } from '../types/repositories.js';
import { Project, NewProject, UpdateProject } from '../types/entities.js';
import { logDbError } from '../utils/logger.js';

import { SupabaseClient } from '@supabase/supabase-js';

export class ProjectRepository extends BaseRepository<Project, NewProject, UpdateProject> implements IProjectRepository {
    constructor(client: SupabaseClient) {
        super('projects', 'project_id', client);
    }

    async findByClientId(clientId: string): Promise<Project[]> {
        const { data, error } = await this.dbConnection
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
        const { data, error } = await this.dbConnection
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
