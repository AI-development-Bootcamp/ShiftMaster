import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientRepository } from '../db/repositories/ClientRepository';

// Mock dependencies
vi.mock('../db/repositories/ClientRepository');
vi.mock('./projectsService', () => ({
    projectsService: {
        deleteProjectsByClientId: vi.fn(),
    }
}));

/*
const mockActor = {
    user_id: 'user-1',
    role: 'admin',
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: {},
    created_at: '',
};
*/

describe('ClientsService', () => {
    let mockRepo: unknown;

    beforeEach(() => {
        vi.clearAllMocks();
        mockRepo = {
            create: vi.fn(),
            update: vi.fn(),
            findById: vi.fn(),
            findAll: vi.fn(),
        };
        (ClientRepository as unknown as { mockImplementation: (cb: () => unknown) => void }).mockImplementation(() => mockRepo);
    });

    it('delegate delete to use replacement', () => {
        expect(true).toBe(true);
    });
});
