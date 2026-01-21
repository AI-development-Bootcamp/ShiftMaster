
import { SupabaseClient } from '@supabase/supabase-js';
import { AdminTaskAssignmentRepository } from '../db/repositories/AdminTaskAssignmentRepository.js';
import { AdminTaskAssignment } from '../db/types/entities.js';
import { Actor, AuthorizationError } from './usersService.js';

export class AssignmentsService {
    private assignmentRepo: AdminTaskAssignmentRepository;

    constructor(client: SupabaseClient) {
        this.assignmentRepo = new AdminTaskAssignmentRepository(client);
    }

    async getAssignmentsByTaskId(taskId: string): Promise<AdminTaskAssignment[]> {
        return this.assignmentRepo.findByTaskId(taskId);
    }

    async getAllActiveAssignments(): Promise<AdminTaskAssignment[]> {
        return this.assignmentRepo.findAllActive();
    }

    async assignEmployees(
        actor: Actor,
        userId: string, // The ID of the user performing the assignment
        taskId: string,
        employeeIds: string[]
    ): Promise<void> {
        if (actor.role !== 'admin') {
            throw new AuthorizationError('Only admins can assign employees to tasks');
        }

        // 1. Get current active assignments for the task
        const currentAssignments = await this.assignmentRepo.findByTaskId(taskId);
        const textCurrentIds = currentAssignments.map(a => a.user_id);

        // 2. Identify employees to add
        const toAdd = employeeIds.filter(id => !textCurrentIds.includes(id));

        // 3. Identify employees to remove (revoke)
        const toRemove = currentAssignments.filter(a => !employeeIds.includes(a.user_id));

        // 4. Perform updates
        // Add new assignments
        for (const empId of toAdd) {
            await this.assignmentRepo.create({
                task_id: taskId,
                user_id: empId,
                assigned_by: userId,
            });
        }

        // Revoke removed assignments
        for (const assignment of toRemove) {
            await this.assignmentRepo.revoke(assignment.admin_task_assignment_id);
        }
    }
}
