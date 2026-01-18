import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientRepository } from '../db/repositories/ClientRepository.js';
import { supabase } from '../db/supabase.js';

describe('ClientRepository', () => {
    let repository: ClientRepository;

    beforeEach(() => {
        repository = new ClientRepository();
        vi.clearAllMocks();
    });

    it('should find active clients', async () => {
        const mockClients = [{ client_id: 1, name: 'Active Client', active: true }];

        // Construct the mock chain
        const orderMock = vi.fn().mockResolvedValue({ data: mockClients, error: null });
        const eqMock = vi.fn().mockReturnValue({ order: orderMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
        const fromMock = vi.fn().mockReturnValue({ select: selectMock });

        supabase.from = fromMock;

        const result = await repository.findActive();

        expect(fromMock).toHaveBeenCalledWith('clients');
        expect(eqMock).toHaveBeenCalledWith('active', true);
        expect(result).toEqual(mockClients);
    });
});
