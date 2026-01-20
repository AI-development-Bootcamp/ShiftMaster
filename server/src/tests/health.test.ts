import { describe, it, expect, vi, afterEach } from 'vitest';
import { checkDatabaseHealth } from '../db/utils/health.js';
import { supabase } from '../db/supabase.js';

describe('Database Health Check', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true when connection succeeds', async () => {
    // Correct mock matching: supabase.from().select() returning a promise
    const selectMock = vi.fn().mockResolvedValue({ error: null, status: 200 });

    vi.spyOn(supabase, 'from').mockReturnValue({ select: selectMock } as unknown as ReturnType<typeof supabase.from>);

    const result = await checkDatabaseHealth();

    expect(supabase.from).toHaveBeenCalledWith('users');
    expect(selectMock).toHaveBeenCalledWith('user_id', { count: 'exact', head: true });
    expect(result).toBe(true);
  });

  it('should return false when connection fails', async () => {
    const selectMock = vi.fn().mockRejectedValue(new Error('Connection failed'));

    vi.spyOn(supabase, 'from').mockReturnValue({ select: selectMock } as unknown as ReturnType<typeof supabase.from>);

    const result = await checkDatabaseHealth();

    expect(result).toBe(false);
  });
});
