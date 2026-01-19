import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './BaseRepository.js';
import { IEntryAssignmentRepository } from '../types/repositories.js';
import { EntryAssignment, NewEntryAssignment, UpdateEntryAssignment } from '../types/entities.js';
import { logDbError } from '../utils/logger.js';

export class EntryAssignmentRepository extends BaseRepository<EntryAssignment, NewEntryAssignment, UpdateEntryAssignment> implements IEntryAssignmentRepository {
    constructor(client?: SupabaseClient) {
        super('entry_assignments', 'entry_assignment_id', client);
    }

    async findByEntryId(entryId: string): Promise<EntryAssignment[]> {
        const { data, error } = await this.dbConnection
            .from(this.table)
            .select('*')
            .eq('entry_id', entryId);

        if (error) {
            logDbError('EntryAssignmentRepository.findByEntryId', error);
            throw error;
        }

        return data as EntryAssignment[];
    }
}
