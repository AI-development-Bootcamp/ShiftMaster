import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClientRepository } from '../db/repositories/ClientRepository.js';
import { supabase } from '../db/supabase.js';

describe('ClientRepository', () => {
    let repository: ClientRepository;

    beforeEach(() => {
        repository = new ClientRepository();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should find active clients', async () => {
        const mockClients = [{ client_id: 1, name: 'Active Client', active: true }];

        // Construct the mock chain
        const orderMock = vi.fn().mockResolvedValue({ data: mockClients, error: null });
        const eqMock = vi.fn().mockReturnValue({ order: orderMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

        // Use spyOn instead of direct assignment
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fromMock = vi.spyOn(supabase, 'from').mockReturnValue({ select: selectMock } as any);

        const result = await repository.findActive();

        expect(fromMock).toHaveBeenCalledWith('clients');
        expect(eqMock).toHaveBeenCalledWith('active', true);
        expect(result).toEqual(mockClients);
    });
});
