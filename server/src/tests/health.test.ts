import { describe, it, expect, vi } from 'vitest';
import { checkDatabaseHealth } from '../db/utils/health.js';
import { supabase } from '../db/supabase.js';

describe('Database Health Check', () => {
    it('should return true when connection succeeds', async () => {
        // Correct mock matching: supabase.from().select() returning a promise
        const selectMock = vi.fn().mockResolvedValue({ error: null, status: 200 });
        const fromMock = vi.fn().mockReturnValue({ select: selectMock });

        supabase.from = fromMock;

        const result = await checkDatabaseHealth();

        expect(fromMock).toHaveBeenCalledWith('users');
        expect(selectMock).toHaveBeenCalledWith('user_id', { count: 'exact', head: true });
        expect(result).toBe(true);
    });

    it('should return false when connection fails', async () => {
        const selectMock = vi.fn().mockRejectedValue(new Error('Connection failed'));
        const fromMock = vi.fn().mockReturnValue({ select: selectMock });

        supabase.from = fromMock;

        const result = await checkDatabaseHealth();

        expect(result).toBe(false);
    });
});
