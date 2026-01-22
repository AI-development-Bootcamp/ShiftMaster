import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import usersRouter from './users.js';
import clientsRouter from './clients.js';
import projectsRouter from './projects.js';
import tasksRouter from './tasks.js';
import timeEntriesRouter from './time-entries.js';
import absencesRouter from './absences.js';
import meRouter from './me.js';

const router = Router();

// Health check route
router.use('/health', healthRouter);

// Authentication routes
router.use('/auth', authRouter);

// User management routes (admin only)
router.use('/users', usersRouter);
router.use('/clients', clientsRouter);
router.use('/projects', projectsRouter);
router.use('/tasks', tasksRouter);

// Time entries and absences routes (authenticated)
router.use('/time-entries', timeEntriesRouter);
router.use('/absences', absencesRouter);
router.use('/me', meRouter);

export default router;

