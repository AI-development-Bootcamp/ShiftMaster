import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './BaseRepository.js';
import { IMonthLockRepository } from '../types/repositories.js';
import { MonthLock, NewMonthLock, UpdateMonthLock } from '../types/entities.js';
import { logDbError } from '../utils/logger.js';

export class MonthLockRepository extends BaseRepository<MonthLock, NewMonthLock, UpdateMonthLock> implements IMonthLockRepository {
    constructor(client: SupabaseClient) {
        super('month_locks', 'lock_id', client);
    }

    async findByYearAndMonth(year: number, month: number): Promise<MonthLock | null> {
        const { data, error } = await this.dbConnection
            .from(this.table)
            .select('*')
            .eq('year', year)
            .eq('month', month)
            .is('unlocked_at', null) // Only consider currently active locks
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            logDbError('MonthLockRepository.findByYearAndMonth', error);
            throw error;
        }

        return data as MonthLock;
    }

    async isMonthLocked(year: number, month: number): Promise<boolean> {
        const lock = await this.findByYearAndMonth(year, month);
        return !!lock;
    }

    async findByYear(year: number): Promise<MonthLock[]> {
        const { data, error } = await this.dbConnection
            .from(this.table)
            .select('*')
            .eq('year', year)
            .is('unlocked_at', null)
            .order('month', { ascending: true });

        if (error) {
            logDbError('MonthLockRepository.findByYear', error);
            throw error;
        }

        return data as MonthLock[];
    }
}
