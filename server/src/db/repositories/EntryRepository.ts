import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './BaseRepository.js';
import { IEntryRepository } from '../types/repositories.js';
import { Entry, NewEntry, UpdateEntry } from '../types/entities.js';
import { logDbError } from '../utils/logger.js';

export class EntryRepository extends BaseRepository<Entry, NewEntry, UpdateEntry> implements IEntryRepository {
    constructor(client?: SupabaseClient) {
        super('entries', 'entry_id', client);
    }

    async findByUserIdAndDate(userId: string, date: string): Promise<Entry[]> {
        const { data, error } = await this.client
            .from(this.table)
            .select('*')
            .eq('user_id', userId)
            .eq('work_date', date);

        if (error) {
            logDbError('EntryRepository.findByUserIdAndDate', error);
            throw error;
        }

        return data as Entry[];
    }

    async findByUserIdAndDateRange(userId: string, startDate: string, endDate: string): Promise<Entry[]> {
        const { data, error } = await this.client
            .from(this.table)
            .select('*')
            .eq('user_id', userId)
            .gte('work_date', startDate)
            .lte('work_date', endDate)
            .order('work_date');

        if (error) {
            logDbError('EntryRepository.findByUserIdAndDateRange', error);
            throw error;
        }

        return data as Entry[];
    }
}
