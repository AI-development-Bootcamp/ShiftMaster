import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { UserRepository } from '../db/repositories/UserRepository.js';
import { supabase } from '../db/supabase.js';

describe('UserRepository', () => {
    let repository: UserRepository;

    beforeEach(() => {
        repository = new UserRepository();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should find user by email', async () => {
        const mockUser = { user_id: 1, email: 'test@example.com', full_name: 'Test User' };

        // Construct the mock chain
        const singleMock = vi.fn().mockResolvedValue({ data: mockUser, error: null });
        const eqMock = vi.fn().mockReturnValue({ single: singleMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

        vi.spyOn(supabase, 'from').mockReturnValue({ select: selectMock } as unknown as ReturnType<typeof supabase.from>);

        const result = await repository.findByEmail('test@example.com');

        expect(supabase.from).toHaveBeenCalledWith('users');
        expect(selectMock).toHaveBeenCalledWith('*');
        expect(eqMock).toHaveBeenCalledWith('email', 'test@example.com');
        expect(result).toEqual(mockUser);
    });

    it('should return null if user not found by email', async () => {
        const singleMock = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
        const eqMock = vi.fn().mockReturnValue({ single: singleMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

        vi.spyOn(supabase, 'from').mockReturnValue({ select: selectMock } as unknown as ReturnType<typeof supabase.from>);

        const result = await repository.findByEmail('missing@example.com');

        expect(result).toBeNull();
    });
});
