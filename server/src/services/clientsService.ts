import { SupabaseClient } from '@supabase/supabase-js';
import { ClientRepository } from '../db/repositories/ClientRepository.js';
import { Client, NewClient, UpdateClient } from '../db/types/entities.js';
import { Actor, AuthorizationError } from './usersService.js';

export class ClientNotFoundError extends Error {
    code = 'CLIENT_NOT_FOUND';
    constructor(clientId: string) {
        super(`Client with ID ${clientId} not found`);
        this.name = 'ClientNotFoundError';
    }
}

export class ClientsService {
    private clientRepo: ClientRepository;
    private supabaseClient: SupabaseClient;

    constructor(client: SupabaseClient) {
        this.clientRepo = new ClientRepository(client);
        this.supabaseClient = client;
    }

    async listClients(actor: Actor, includeInactive = false): Promise<Client[]> {
        if (actor.role !== 'admin') {
            throw new AuthorizationError('Access denied: Only admins can list clients');
        }

        if (includeInactive) {
            return this.clientRepo.findAll();
        }
        return this.clientRepo.findActive();
    }

    // Create a new client
    async createClient(actor: Actor, data: NewClient): Promise<Client> {
        if (actor.role !== 'admin') {
            throw new AuthorizationError('Access denied: Only admins can create clients');
        }

        return this.clientRepo.create(data);
    }

    // Update a client
    async updateClient(actor: Actor, id: string, data: UpdateClient): Promise<Client> {
        if (actor.role !== 'admin') {
            throw new AuthorizationError('Access denied: Only admins can update clients');
        }

        const client = await this.clientRepo.findById(id);
        if (!client) {
            throw new ClientNotFoundError(id);
        }

        return this.clientRepo.update(id, data);
    }

    // Soft delete a client (with transactional cascade to projects and tasks)
    // Uses a Postgres RPC function for atomic operation
    async deleteClient(actor: Actor, id: string): Promise<void> {
        if (actor.role !== 'admin') {
            throw new AuthorizationError('Access denied: Only admins can delete clients');
        }

        const client = await this.clientRepo.findById(id);
        if (!client) {
            throw new ClientNotFoundError(id);
        }

        // Use RPC function for atomic cascade delete
        const { error } = await this.supabaseClient.rpc('delete_client_cascade', {
            p_client_id: id
        });

        if (error) {
            console.error(`[ClientsService.deleteClient] Cascade delete failed for client ${id}:`, error);
            throw error;
        }
    }
}
