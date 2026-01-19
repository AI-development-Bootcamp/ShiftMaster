import { UserRepository } from './UserRepository.js';
import { ClientRepository } from './ClientRepository.js';
import { ProjectRepository } from './ProjectRepository.js';
import { TaskRepository } from './TaskRepository.js';
import { AdminTaskAssignmentRepository } from './AdminTaskAssignmentRepository.js';
import { EntryRepository } from './EntryRepository.js';
import { EntryAssignmentRepository } from './EntryAssignmentRepository.js';
import { MonthLockRepository } from './MonthLockRepository.js';

// Export classes
export * from './BaseRepository.js';
export * from './UserRepository.js';
export * from './ClientRepository.js';
export * from './ProjectRepository.js';
export * from './TaskRepository.js';
export * from './AdminTaskAssignmentRepository.js';
export * from './EntryRepository.js';
export * from './EntryAssignmentRepository.js';
export * from './MonthLockRepository.js';

// Export singleton instances
export const userRepository = new UserRepository();
export const clientRepository = new ClientRepository();
export const projectRepository = new ProjectRepository();
export const taskRepository = new TaskRepository();
export const adminTaskAssignmentRepository = new AdminTaskAssignmentRepository();
export const entryRepository = new EntryRepository();
export const entryAssignmentRepository = new EntryAssignmentRepository();
export const monthLockRepository = new MonthLockRepository();
