import { BaseRepository } from './BaseRepository.js';
import { IAdminTaskAssignmentRepository } from '../types/repositories.js';
import { AdminTaskAssignment, NewAdminTaskAssignment, UpdateAdminTaskAssignment } from '../types/entities.js';
import { logDbError } from '../utils/logger.js';

export class AdminTaskAssignmentRepository extends BaseRepository<AdminTaskAssignment, NewAdminTaskAssignment, UpdateAdminTaskAssignment> implements IAdminTaskAssignmentRepository {
    constructor() {
        super('admin_task_assignments', 'admin_task_assignment_id');
    }

    async findByUserId(userId: number): Promise<AdminTaskAssignment[]> {
        const { data, error } = await this.client
            .from(this.table)
            .select('*')
            .eq('user_id', userId)
            .eq('active', true);

        if (error) {
            logDbError('AdminTaskAssignmentRepository.findByUserId', error);
            throw error;
        }

        return data as AdminTaskAssignment[];
    }

    async findByTaskId(taskId: number): Promise<AdminTaskAssignment[]> {
        const { data, error } = await this.client
            .from(this.table)
            .select('*')
            .eq('task_id', taskId)
            .eq('active', true);

        if (error) {
            logDbError('AdminTaskAssignmentRepository.findByTaskId', error);
            throw error;
        }

        return data as AdminTaskAssignment[];
    }

    async revoke(id: number): Promise<void> {
        const { error } = await this.client
            .from(this.table)
            .update({ active: false, revoked_at: new Date().toISOString() })
            .eq(this.primaryKey, id);

        if (error) {
            logDbError('AdminTaskAssignmentRepository.revoke', error);
            throw error;
        }
    }
}
