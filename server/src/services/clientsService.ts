/**
 * Client Management Service
 * Business logic for client CRUD operations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Client, NewClient, UpdateClient, UserRole } from '../db/types/entities.js';
import { ClientRepository } from '../db/repositories/ClientRepository.js';

export class AuthorizationError extends Error {
    code = 'FORBIDDEN';
    constructor(message: string = 'Access denied') {
        super(message);
        this.name = 'AuthorizationError';
    }
}

export class ClientNotFoundError extends Error {
    code = 'CLIENT_NOT_FOUND';
    constructor(clientId: string) {
        super(`Client with ID ${clientId} not found`);
        this.name = 'ClientNotFoundError';
    }
}

export interface Actor {
    role: UserRole;
}

export interface PaginatedClientsResponse {
    clients: Client[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export class ClientsService {
    private clientRepo: ClientRepository;

    constructor(db: SupabaseClient) {
        this.clientRepo = new ClientRepository(db);
    }

    /**
     * Helper to enforce admin access
     */
    private requireAdmin(actor: Actor) {
        if (actor.role !== 'admin') {
            throw new AuthorizationError('Access denied: Admin role required');
        }
    }

    /**
     * Create a new client (Admin only)
     */
    async createClient(
        actor: Actor,
        clientData: { name: string; contact_info?: string }
    ): Promise<Client> {
        this.requireAdmin(actor);

        const newClient: NewClient = {
            name: clientData.name,
            contact_info: clientData.contact_info,
            active: true,
        };

        const createdClient = await this.clientRepo.create(newClient);
        return createdClient;
    }

    /**
     * List clients with pagination (Admin only)
     */
    async listClients(
        actor: Actor,
        page: number = 1,
        limit: number = 20,
        search?: string,
        sort: 'asc' | 'desc' = 'asc',
        includeInactive: boolean = false
    ): Promise<PaginatedClientsResponse> {
        this.requireAdmin(actor);

        const { data, count } = await this.clientRepo.findPaginated(
            page,
            limit,
            search,
            sort,
            includeInactive
        );

        return {
            clients: data,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        };
    }

    /**
     * Get client by ID (Admin only)
     */
    async getClientById(actor: Actor, clientId: string): Promise<Client> {
        this.requireAdmin(actor);

        const client = await this.clientRepo.findById(clientId);

        if (!client) {
            throw new ClientNotFoundError(clientId);
        }

        return client;
    }

    /**
     * Update client details (Admin only)
     */
    async updateClient(
        actor: Actor,
        clientId: string,
        updates: { name?: string; contact_info?: string; active?: boolean }
    ): Promise<Client> {
        this.requireAdmin(actor);

        // Verify existence first
        const existingClient = await this.clientRepo.findById(clientId);
        if (!existingClient) {
            throw new ClientNotFoundError(clientId);
        }

        const updateData: UpdateClient = {
            ...updates
        };

        const updatedClient = await this.clientRepo.update(clientId, updateData);
        return updatedClient;
    }

    /**
     * Soft delete client (Admin only)
     */
    async deleteClient(actor: Actor, clientId: string): Promise<void> {
        this.requireAdmin(actor);

        // Verify existence first
        const existingClient = await this.clientRepo.findById(clientId);
        if (!existingClient) {
            throw new ClientNotFoundError(clientId);
        }

        await this.clientRepo.delete(clientId);
    }
}
