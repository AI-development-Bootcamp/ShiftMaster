import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientsService, ClientNotFoundError } from './clientsService';
import { ClientRepository } from '../db/repositories/ClientRepository';
import { ProjectsService } from './projectsService';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock dependencies
vi.mock('../db/repositories/ClientRepository');
vi.mock('./projectsService');

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
    let mockProjectsService: {
        deleteProjectsByClientId: ReturnType<typeof vi.fn>;
    };

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

        mockProjectsService = {
            deleteProjectsByClientId: vi.fn(),
        };

        vi.mocked(ClientRepository).mockImplementation(() => mockClientRepo as unknown as ClientRepository);
        vi.mocked(ProjectsService).mockImplementation(() => mockProjectsService as unknown as ProjectsService);

        // Create service instance with mock Supabase client
        const mockSupabaseClient = {} as SupabaseClient;
        service = new ClientsService(mockSupabaseClient);
    });

    describe('deleteClient', () => {
        it('should cascade delete projects before deleting client', async () => {
            const clientId = 'client-123';
            mockClientRepo.findById.mockResolvedValue({ client_id: clientId, name: 'Test', active: true });
            mockProjectsService.deleteProjectsByClientId.mockResolvedValue(undefined);
            mockClientRepo.delete.mockResolvedValue(undefined);

            await service.deleteClient({ role: 'admin' }, clientId);

            expect(mockProjectsService.deleteProjectsByClientId).toHaveBeenCalledWith(clientId);
            expect(mockClientRepo.delete).toHaveBeenCalledWith(clientId);
        });

        it('should throw ClientNotFoundError if client does not exist', async () => {
            mockClientRepo.findById.mockResolvedValue(null);

            await expect(service.deleteClient({ role: 'admin' }, 'nonexistent'))
                .rejects.toThrow(ClientNotFoundError);
        });

        it('should propagate cascade delete error', async () => {
            const clientId = 'client-123';
            const cascadeError = new Error('Cascade failed');
            mockClientRepo.findById.mockResolvedValue({ client_id: clientId, name: 'Test', active: true });
            mockProjectsService.deleteProjectsByClientId.mockRejectedValue(cascadeError);

            await expect(service.deleteClient({ role: 'admin' }, clientId))
                .rejects.toThrow(cascadeError);

            // Client delete should not have been called since cascade failed
            expect(mockClientRepo.delete).not.toHaveBeenCalled();
        });
    });
});
