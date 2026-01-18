import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProjectRepository } from '../db/repositories/ProjectRepository.js';
import { supabase } from '../db/supabase.js';

describe('ProjectRepository', () => {
    let repository: ProjectRepository;

    beforeEach(() => {
        repository = new ProjectRepository();
        vi.clearAllMocks();
    });

    it('should find projects by client id', async () => {
        const mockProjects = [{ project_id: 1, client_id: 1, name: 'Project A' }];

        const orderMock = vi.fn().mockResolvedValue({ data: mockProjects, error: null });
        const eqMock = vi.fn().mockReturnValue({ order: orderMock });
        const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
        const fromMock = vi.fn().mockReturnValue({ select: selectMock });

        supabase.from = fromMock;

        const result = await repository.findByClientId(1);

        expect(fromMock).toHaveBeenCalledWith('projects');
        expect(eqMock).toHaveBeenCalledWith('client_id', 1);
        expect(result).toEqual(mockProjects);
    });
});
