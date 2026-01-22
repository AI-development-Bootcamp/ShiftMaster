import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupabaseClient } from '@supabase/supabase-js';

// Create mock functions before mocking
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockFindById = vi.fn();
const mockFindAll = vi.fn();
const mockFindActive = vi.fn();
const mockDelete = vi.fn();

// Mock dependencies
vi.mock('../../db/repositories/ClientRepository', () => ({
  ClientRepository: vi.fn().mockImplementation(() => ({
    create: mockCreate,
    update: mockUpdate,
    findById: mockFindById,
    findAll: mockFindAll,
    findActive: mockFindActive,
    delete: mockDelete,
  })),
}));

// Import after mocking
import { ClientsService, ClientNotFoundError } from '../../services/clientsService';

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
    let mockRpc: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();

        mockRpc = vi.fn();

        // Create service instance with mock Supabase client that has rpc method
        const mockSupabaseClient = {
            rpc: mockRpc,
        } as unknown as SupabaseClient;
        service = new ClientsService(mockSupabaseClient);
    });

    describe('deleteClient', () => {
        it('should call RPC for transactional cascade delete', async () => {
            const clientId = 'client-123';
            mockFindById.mockResolvedValue({ client_id: clientId, name: 'Test', active: true });
            mockRpc.mockResolvedValue({ data: null, error: null });

            await service.deleteClient({ role: 'admin' }, clientId);

            expect(mockRpc).toHaveBeenCalledWith('delete_client_cascade', {
                p_client_id: clientId
            });
        });

        it('should throw ClientNotFoundError if client does not exist', async () => {
            mockFindById.mockResolvedValue(null);

            await expect(service.deleteClient({ role: 'admin' }, 'nonexistent'))
                .rejects.toThrow(ClientNotFoundError);

            // RPC should not be called if client doesn't exist
            expect(mockRpc).not.toHaveBeenCalled();
        });

        it('should propagate RPC error on cascade delete failure', async () => {
            const clientId = 'client-123';
            const rpcError = { code: 'PGRST500', message: 'Cascade failed' };
            mockFindById.mockResolvedValue({ client_id: clientId, name: 'Test', active: true });
            mockRpc.mockResolvedValue({ data: null, error: rpcError });

            await expect(service.deleteClient({ role: 'admin' }, clientId))
                .rejects.toEqual(rpcError);
        });
    });
});
