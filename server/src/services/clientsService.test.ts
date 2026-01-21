
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clientsService } from './clientsService';
import { projectsService } from './projectsService';
import { ClientRepository } from '../repositories/ClientRepository';
import { ClientNotFoundError } from './clientsService';

// Mock dependencies
vi.mock('../repositories/ClientRepository');
vi.mock('./projectsService', () => ({
    projectsService: {
        deleteProjectsByClientId: vi.fn(),
    }
}));

const mockActor = {
    user_id: 'user-1',
    role: 'admin',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '',
};

describe('ClientsService', () => {
    let mockRepo: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockRepo = {
            create: vi.fn(),
            update: vi.fn(),
            findById: vi.fn(),
            findAll: vi.fn(),
        };
        // Inject mock repo (assuming we can or we mocked the class constructor)
        // Since clientsService instantiates ClientRepository internally, we rely on vi.mock to return our mock instance
        // But strictly, clientsService uses `new ClientRepository()`.
        // We need to make sure `new ClientRepository()` returns our mockRepo.

        // This is tricky with singleton/direct instantiation.
        // Let's use vi.spyOn if possible or rely on the module mock.
        (ClientRepository as any).mockImplementation(() => mockRepo);

        // Re-instantiate service if needed or just use the imported one which should use the mocked repo class
        // But clientsService is an instance exported.
        // We might need to access the repo property or spy on the prototype.
    });

    // Easier way: Spy on the keys of the existing service instance IF it allows property injection, 
    // OR just use the mocked module logic if we can reset modules. 
    // Given the constraints, let's assume direct swappable or we spy on the instance methods? No, that defeats the purpose.
    // We already mocked ClientRepository module. The service imports it.
    // If the service was created at module load time, it might have already created the instance of Repo.
    // If so, we need to spy on the repo instance methods held by the service.

    // Check clientsService.ts structure. It exports `new ClientsService()`.
    // And it has `private clientsRepo = new ClientRepository();`

    // So we need to cast service to any and swap the repo, or spy on repo methods.

    it('delegate delete to use replacement', () => { });
});
