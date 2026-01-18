import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from '../db/repositories/UserRepository.js';
import { supabase } from '../db/supabase.js';

// Mock Supabase client
vi.mock('../db/supabase.js', () => ({
    supabase: {
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(),
                single: vi.fn()
            })),
            insert: vi.fn(() => ({
                select: vi.fn(() => ({
                    single: vi.fn()
                }))
            })),
            update: vi.fn(() => ({
                eq: vi.fn(() => ({
                    select: vi.fn(() => ({
                        single: vi.fn()
                    }))
                }))
            })),
            delete: vi.fn(() => ({
                eq: vi.fn()
            }))
        }))
    }
}));

describe('UserRepository', () => {
    let repository: UserRepository;

    beforeEach(() => {
        repository = new UserRepository();
        vi.clearAllMocks();
    });

    it('should find user by email', async () => {
        const mockUser = { user_id: 1, email: 'test@example.com', full_name: 'Test User' };

        // Construct the mock chain
        const singleMock = vi.fn().mockResolvedValue({ data: mockUser, error: null });
        const eqMock = vi.fn().mockReturnValue({ single: singleMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
        const fromMock = vi.fn().mockReturnValue({ select: selectMock });

        supabase.from = fromMock;

        const result = await repository.findByEmail('test@example.com');

        expect(fromMock).toHaveBeenCalledWith('users');
        expect(selectMock).toHaveBeenCalledWith('*');
        expect(eqMock).toHaveBeenCalledWith('email', 'test@example.com');
        expect(result).toEqual(mockUser);
    });

    it('should return null if user not found by email', async () => {
        const singleMock = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
        const eqMock = vi.fn().mockReturnValue({ single: singleMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
        const fromMock = vi.fn().mockReturnValue({ select: selectMock });

        supabase.from = fromMock;

        const result = await repository.findByEmail('missing@example.com');

        expect(result).toBeNull();
    });
});
