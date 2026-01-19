import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProjectRepository } from '../db/repositories/ProjectRepository.js';
import { supabase } from '../db/supabase.js';

describe('ProjectRepository', () => {
    let repository: ProjectRepository;

    beforeEach(() => {
        repository = new ProjectRepository();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should find projects by client id', async () => {
        const mockProjects = [{ project_id: 1, client_id: 1, name: 'Project A' }];

        const orderMock = vi.fn().mockResolvedValue({ data: mockProjects, error: null });
        const eqMock = vi.fn().mockReturnValue({ order: orderMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

        // Use spyOn
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fromMock = vi.spyOn(supabase, 'from').mockReturnValue({ select: selectMock } as any);

        const result = await repository.findByClientId(1);

        expect(fromMock).toHaveBeenCalledWith('projects');
        expect(eqMock).toHaveBeenCalledWith('client_id', 1);
        expect(result).toEqual(mockProjects);
    });
});
