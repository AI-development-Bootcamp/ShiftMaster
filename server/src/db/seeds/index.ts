import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { users } from './users.seed.js';
import { clients } from './clients.seed.js';
import { projects } from './projects.seed.js';
import { tasks } from './tasks.seed.js';
import { logDbOperation, logDbError } from '../utils/logger.js';
import {
    UserRepository,
    ClientRepository,
    ProjectRepository,
    TaskRepository
} from '../repositories/index.js';
import { supabaseAdmin } from '../supabase.js';
import { User, Client, Project } from '../types/entities.js';

// Initialize repositories with Admin client to bypass RLS
const userRepository = new UserRepository(supabaseAdmin);
const clientRepository = new ClientRepository(supabaseAdmin);
const projectRepository = new ProjectRepository(supabaseAdmin);
const taskRepository = new TaskRepository(supabaseAdmin);

async function seed() {
    logDbOperation('Starting database seed...');

    try {
        // 1. Clear existing data (optional, maybe configurable)
        // For now, we assume development environment so we can truncate or delete
        // But due to FK constraints, we must delete in order
        // However, our repositories check existing records often, so maybe we just upsert?
        // Let's rely on cleaning manually or add a cleanup script if needed.
        // For this 'seed:dev', let's assume valid state or clean slate is better.
        // Since we don't have a direct 'truncate' tool exposed easily via repositories
        // and RLS prevents simple delete all, we might need a separate admin cleanup.
        // Let's just create new items if they don't exist by email/name.

        // 2. Users
        const createdUsers: User[] = [];

        // Hash password for all users
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt); // Default password for everyone

        for (const u of users) {
            // Check if user exists
            const existing = await userRepository.findByEmail(u.email);
            if (existing) {
                createdUsers.push(existing);
                logDbOperation(`User already exists: ${u.email}`);
            } else {
                const newUser = await userRepository.create({
                    ...u,
                    password_hash: hashedPassword
                });
                createdUsers.push(newUser);
                logDbOperation(`Created user: ${u.email}`);
            }
        }

        const adminUser = createdUsers.find(u => u.role === 'admin') || createdUsers[0];

        // 3. Clients
        const createdClients: Client[] = [];
        for (const c of clients) {
            // We lack a 'findByName' in repository, let's just create them. 
            // Ideally we should check existence to avoid dupes if run twice.
            // For simplicity in this script, we'll fetch all and check locally.
            const allClients = await clientRepository.findActive();
            const existing = allClients.find(ec => ec.name === c.name);

            if (existing) {
                createdClients.push(existing);
                logDbOperation(`Client already exists: ${c.name}`);
            } else {
                const newClient = await clientRepository.create(c);
                createdClients.push(newClient);
                logDbOperation(`Created client: ${c.name}`);
            }
        }

        // 4. Projects
        const createdProjects: Project[] = [];
        for (const p of projects) {
            const client = createdClients[p.clientIndex];
            // Ensure we have a client reference
            if (!client) continue;

            const newProjectData = {
                client_id: client.client_id,
                manager_user_id: adminUser.user_id, // Assign all to admin for simplicity
                name: p.name,
                description: p.description,
                start_date: p.start_date,
                time_format_type: p.time_format_type,
                active: p.active
            };

            // Simple check implementation
            const clientProjects = await projectRepository.findByClientId(client.client_id);
            const existing = clientProjects.find(ep => ep.name === p.name);

            if (existing) {
                createdProjects.push(existing);
                logDbOperation(`Project already exists: ${p.name}`);
            } else {
                const newProject = await projectRepository.create(newProjectData);
                createdProjects.push(newProject);
                logDbOperation(`Created project: ${p.name}`);
            }
        }

        // 5. Tasks
        for (const t of tasks) {
            const project = createdProjects[t.projectIndex];
            if (!project) continue;

            const newTaskData = {
                project_id: project.project_id,
                name: t.name,
                description: t.description,
                start_date: t.start_date
            };

            const projectTasks = await taskRepository.findByProjectId(project.project_id);
            const existing = projectTasks.find(et => et.name === t.name);

            if (existing) {
                logDbOperation(`Task already exists: ${t.name}`);
            } else {
                await taskRepository.create(newTaskData);
                logDbOperation(`Created task: ${t.name}`);
            }
        }

        logDbOperation('Database seeding completed successfully.');
        process.exit(0);

    } catch (error) {
        logDbError('Database seeding failed', error);
        process.exit(1);
    }
}

seed();
