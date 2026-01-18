import { BaseRepository } from './BaseRepository.js';
import { IEntryAssignmentRepository } from '../types/repositories.js';
import { EntryAssignment, NewEntryAssignment, UpdateEntryAssignment } from '../types/entities.js';
import { logDbError } from '../utils/logger.js';

export class EntryAssignmentRepository extends BaseRepository<EntryAssignment, NewEntryAssignment, UpdateEntryAssignment> implements IEntryAssignmentRepository {
    constructor() {
        super('entry_assignments', 'entry_assignment_id');
    }

    async findByEntryId(entryId: number): Promise<EntryAssignment[]> {
        const { data, error } = await this.client
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
