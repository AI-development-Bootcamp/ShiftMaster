import { SupabaseClient } from '@supabase/supabase-js';
import { ClientRepository } from '../db/repositories/ClientRepository.js';
import { Client, NewClient, UpdateClient } from '../db/types/entities.js';
import { ProjectsService } from './projectsService.js';
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
    private projectsService: ProjectsService;

    constructor(client: SupabaseClient) {
        this.clientRepo = new ClientRepository(client);
        this.projectsService = new ProjectsService(client);
    }

    async listClients(includeInactive = false): Promise<Client[]> {
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

    // Soft delete a client
    // Note: Supabase JS client doesn't support client-side transactions.
    // We wrap in try-catch and propagate errors with context.
    async deleteClient(actor: Actor, id: string): Promise<void> {
        if (actor.role !== 'admin') {
            throw new AuthorizationError('Access denied: Only admins can delete clients');
        }

        const client = await this.clientRepo.findById(id);
        if (!client) {
            throw new ClientNotFoundError(id);
        }

        try {
            // Cascade delete projects (and their tasks)
            await this.projectsService.deleteProjectsByClientId(id);

            // Delete client
            await this.clientRepo.delete(id);
        } catch (error) {
            // Log and rethrow with context for callers to handle
            console.error(`[ClientsService.deleteClient] Cascade delete failed for client ${id}:`, error);
            throw error;
        }
    }
}
