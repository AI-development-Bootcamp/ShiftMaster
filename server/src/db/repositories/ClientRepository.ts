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
}
