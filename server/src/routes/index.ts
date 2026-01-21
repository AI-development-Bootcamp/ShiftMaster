import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import usersRouter from './users.js';
import clientsRouter from './clients.js';
import projectsRouter from './projects.js';
import tasksRouter from './tasks.js';

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

// Add more route modules here
// etc.

export default router;
