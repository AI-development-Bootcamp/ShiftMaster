import { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './BaseRepository.js';
import { IUserRepository } from '../types/repositories.js';
import { User, NewUser, UpdateUser } from '../types/entities.js';
import { logDbError } from '../utils/logger.js';

export class UserRepository extends BaseRepository<User, NewUser, UpdateUser> implements IUserRepository {
    constructor(client: SupabaseClient) {
        super('users', 'user_id', client);
    }

    async findByEmail(email: string): Promise<User | null> {
        const { data, error } = await this.dbConnection
            .from(this.table)
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            logDbError('UserRepository.findByEmail', error);
            throw error;
        }

        return data as User;
    }

    async findPaginated(page: number, limit: number): Promise<{ data: User[]; count: number }> {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, error, count } = await this.dbConnection
            .from(this.table)
            .select('*', { count: 'exact' })
            .range(from, to);

        if (error) {
            logDbError('UserRepository.findPaginated', error);
            throw error;
        }

        return {
            data: (data as User[]) || [],
            count: count || 0
        };
    }
}
