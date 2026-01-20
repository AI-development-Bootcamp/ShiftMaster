import { BaseRepository } from './BaseRepository.js';
import { IClientRepository } from '../types/repositories.js';
import { Client, NewClient, UpdateClient } from '../types/entities.js';
import { logDbError } from '../utils/logger.js';

import { SupabaseClient } from '@supabase/supabase-js';

export class ClientRepository extends BaseRepository<Client, NewClient, UpdateClient> implements IClientRepository {
    constructor(client: SupabaseClient) {
        super('clients', 'client_id', client);
    }

    async findActive(): Promise<Client[]> {
        const { data, error } = await this.dbConnection
            .from(this.table)
            .select('*')
            .eq('active', true)
            .order('name');

        if (error) {
            logDbError('ClientRepository.findActive', error);
            throw error;
        }

        return data as Client[];
    }

    async findPaginated(
        page: number,
        limit: number,
        search?: string,
        sort: 'asc' | 'desc' = 'asc',
        includeInactive: boolean = false
    ): Promise<{ data: Client[]; count: number }> {
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = this.dbConnection
            .from(this.table)
            .select('*', { count: 'exact' });

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        if (!includeInactive) {
            query = query.eq('active', true);
        }

        // Order by name
        query = query.order('name', { ascending: sort === 'asc' });

        const { data, count, error } = await query.range(from, to);

        if (error) {
            logDbError('ClientRepository.findPaginated', error);
            throw error;
        }

        return {
            data: (data as Client[]) || [],
            count: count || 0
        };
    }
}
