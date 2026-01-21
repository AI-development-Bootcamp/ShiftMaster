import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientsService, ClientNotFoundError } from './clientsService';
import { ClientRepository } from '../db/repositories/ClientRepository';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock dependencies
vi.mock('../db/repositories/ClientRepository');

const _mockActor = {
    user_id: 'user-1',
    role: 'admin',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '',
};

describe('ClientsService', () => {
    let service: ClientsService;
    let mockClientRepo: {
        create: ReturnType<typeof vi.fn>;
        update: ReturnType<typeof vi.fn>;
        findById: ReturnType<typeof vi.fn>;
        findAll: ReturnType<typeof vi.fn>;
        findActive: ReturnType<typeof vi.fn>;
        delete: ReturnType<typeof vi.fn>;
    };
    let mockRpc: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();

        mockClientRepo = {
            create: vi.fn(),
            update: vi.fn(),
            findById: vi.fn(),
            findAll: vi.fn(),
            findActive: vi.fn(),
            delete: vi.fn(),
        };

        mockRpc = vi.fn();

        vi.mocked(ClientRepository).mockImplementation(() => mockClientRepo as unknown as ClientRepository);

        // Create service instance with mock Supabase client that has rpc method
        const mockSupabaseClient = {
            rpc: mockRpc,
        } as unknown as SupabaseClient;
        service = new ClientsService(mockSupabaseClient);
    });

    describe('deleteClient', () => {
        it('should call RPC for transactional cascade delete', async () => {
            const clientId = 'client-123';
            mockClientRepo.findById.mockResolvedValue({ client_id: clientId, name: 'Test', active: true });
            mockRpc.mockResolvedValue({ data: null, error: null });

            await service.deleteClient({ role: 'admin' }, clientId);

            expect(mockRpc).toHaveBeenCalledWith('delete_client_cascade', {
                p_client_id: clientId
            });
        });

        it('should throw ClientNotFoundError if client does not exist', async () => {
            mockClientRepo.findById.mockResolvedValue(null);

            await expect(service.deleteClient({ role: 'admin' }, 'nonexistent'))
                .rejects.toThrow(ClientNotFoundError);

            // RPC should not be called if client doesn't exist
            expect(mockRpc).not.toHaveBeenCalled();
        });

        it('should propagate RPC error on cascade delete failure', async () => {
            const clientId = 'client-123';
            const rpcError = { code: 'PGRST500', message: 'Cascade failed' };
            mockClientRepo.findById.mockResolvedValue({ client_id: clientId, name: 'Test', active: true });
            mockRpc.mockResolvedValue({ data: null, error: rpcError });

            await expect(service.deleteClient({ role: 'admin' }, clientId))
                .rejects.toEqual(rpcError);
        });
    });
});
