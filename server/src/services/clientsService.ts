
import { SupabaseClient } from '@supabase/supabase-js';
import { ClientRepository } from '../db/repositories/ClientRepository.js';
import { Client } from '../db/types/entities.js';

export class ClientsService {
    private clientRepo: ClientRepository;

    constructor(client: SupabaseClient) {
        this.clientRepo = new ClientRepository(client);
    }

    async listClients(): Promise<Client[]> {
        return this.clientRepo.findActive();
    }
}
