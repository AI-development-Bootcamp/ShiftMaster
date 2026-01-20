/**
 * Tests for ClientsService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';
import {
    ClientsService,
    ClientNotFoundError,
    AuthorizationError
} from '../../services/clientsService.js';
import { Client } from '../../db/types/entities.js';

// Mock the ClientRepository
vi.mock('../../db/repositories/ClientRepository.js', () => {
    return {
        ClientRepository: vi.fn(() => ({
            create: vi.fn(),
            findById: vi.fn(),
            findAll: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
            findPaginated: vi.fn(),
            findActive: vi.fn(),
        })),
    };
});

describe('ClientsService', () => {
    let clientsService: ClientsService;
    let mockClientRepo: {
        create: ReturnType<typeof vi.fn>;
        findById: ReturnType<typeof vi.fn>;
        findAll: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
        findPaginated: ReturnType<typeof vi.fn>;
        findActive: ReturnType<typeof vi.fn>;
    };

    const mockClient: Client = {
        client_id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Client',
        contact_info: 'test@example.com',
        active: true,
        created_at: '2024-01-01T00:00:00Z'
    };

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Create mock Supabase client
        const mockSupabaseClient = {} as SupabaseClient;

        // Create service instance with mock client
        clientsService = new ClientsService(mockSupabaseClient);

        // Get mock repository instance (accessing private property for testing)
        mockClientRepo = (
            clientsService as unknown as { clientRepo: typeof mockClientRepo }
        ).clientRepo;
    });

    describe('createClient', () => {
        const newClientData = {
            name: 'New Client',
            contact_info: 'new@example.com',
        };

        it('should create a new client successfully (Admin)', async () => {
            mockClientRepo.create.mockResolvedValue({
                ...mockClient,
                name: newClientData.name,
                contact_info: newClientData.contact_info,
            });

            const actor = { role: 'admin' as const };
            const result = await clientsService.createClient(actor, newClientData);

            expect(mockClientRepo.create).toHaveBeenCalledWith({
                name: newClientData.name,
                contact_info: newClientData.contact_info,
                active: true,
            });
            expect(result.name).toBe(newClientData.name);
        });

        it('should throw AuthorizationError if actor is not admin', async () => {
            const actor = { role: 'regular' as const };
            await expect(clientsService.createClient(actor, newClientData)).rejects.toThrow(
                AuthorizationError
            );
            expect(mockClientRepo.create).not.toHaveBeenCalled();
        });
    });

    describe('listClients', () => {
        const mockClients: Client[] = [
            mockClient,
            { ...mockClient, client_id: '2', name: 'Client 2' }
        ];

        it('should return paginated clients', async () => {
            mockClientRepo.findPaginated.mockResolvedValue({
                data: mockClients,
                count: 2,
            });

            const actor = { role: 'admin' as const };
            const result = await clientsService.listClients(actor);

            expect(mockClientRepo.findPaginated).toHaveBeenCalledWith(1, 20, undefined, 'asc', false);
            expect(result.clients).toHaveLength(2);
            expect(result.pagination.total).toBe(2);
        });

        it('should pass search term and sort/filter options to findPaginated', async () => {
            mockClientRepo.findPaginated.mockResolvedValue({
                data: [mockClients[0]],
                count: 1,
            });

            const actor = { role: 'admin' as const };
            await clientsService.listClients(actor, 1, 20, 'Test', 'desc', true);

            expect(mockClientRepo.findPaginated).toHaveBeenCalledWith(1, 20, 'Test', 'desc', true);
        });

        it('should throw AuthorizationError if actor is not admin', async () => {
            const actor = { role: 'regular' as const };
            await expect(clientsService.listClients(actor)).rejects.toThrow(AuthorizationError);
        });
    });

    describe('getClientById', () => {
        it('should return client by ID', async () => {
            mockClientRepo.findById.mockResolvedValue(mockClient);

            const actor = { role: 'admin' as const };
            const result = await clientsService.getClientById(actor, mockClient.client_id);

            expect(mockClientRepo.findById).toHaveBeenCalledWith(mockClient.client_id);
            expect(result).toEqual(mockClient);
        });

        it('should throw ClientNotFoundError if client not found', async () => {
            mockClientRepo.findById.mockResolvedValue(null);

            const actor = { role: 'admin' as const };
            await expect(clientsService.getClientById(actor, 'non-existent')).rejects.toThrow(
                ClientNotFoundError
            );
        });

        it('should throw AuthorizationError if actor is not admin', async () => {
            const actor = { role: 'regular' as const };
            await expect(clientsService.getClientById(actor, '1')).rejects.toThrow(
                AuthorizationError
            );
        });
    });

    describe('updateClient', () => {
        const updates = { name: 'Updated Client' };

        it('should update client successfully', async () => {
            mockClientRepo.findById.mockResolvedValue(mockClient);
            mockClientRepo.update.mockResolvedValue({ ...mockClient, ...updates });

            const actor = { role: 'admin' as const };
            const result = await clientsService.updateClient(
                actor,
                mockClient.client_id,
                updates
            );

            expect(mockClientRepo.findById).toHaveBeenCalledWith(mockClient.client_id);
            expect(mockClientRepo.update).toHaveBeenCalledWith(mockClient.client_id, updates);
            expect(result.name).toBe(updates.name);
        });

        it('should throw ClientNotFoundError if client not found', async () => {
            mockClientRepo.findById.mockResolvedValue(null);

            const actor = { role: 'admin' as const };
            await expect(
                clientsService.updateClient(actor, 'non-existent', updates)
            ).rejects.toThrow(ClientNotFoundError);
            expect(mockClientRepo.update).not.toHaveBeenCalled();
        });

        it('should throw AuthorizationError if actor is not admin', async () => {
            const actor = { role: 'regular' as const };
            await expect(
                clientsService.updateClient(actor, mockClient.client_id, updates)
            ).rejects.toThrow(AuthorizationError);
        });
    });

    describe('deleteClient', () => {
        it('should delete client successfully', async () => {
            mockClientRepo.findById.mockResolvedValue(mockClient);
            mockClientRepo.delete.mockResolvedValue(true);

            const actor = { role: 'admin' as const };
            await clientsService.deleteClient(actor, mockClient.client_id);

            expect(mockClientRepo.findById).toHaveBeenCalledWith(mockClient.client_id);
            expect(mockClientRepo.delete).toHaveBeenCalledWith(mockClient.client_id);
        });

        it('should throw ClientNotFoundError if client not found', async () => {
            mockClientRepo.findById.mockResolvedValue(null);

            const actor = { role: 'admin' as const };
            await expect(
                clientsService.deleteClient(actor, 'non-existent')
            ).rejects.toThrow(ClientNotFoundError);
            expect(mockClientRepo.delete).not.toHaveBeenCalled();
        });
    });
});
