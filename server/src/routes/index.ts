import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import usersRouter from './users.js';
import projectsRouter from './projects.js';

const router = Router();

// Health check route
router.use('/health', healthRouter);

// Authentication routes
router.use('/auth', authRouter);

// User management routes (admin only)
// User management routes (admin only)
router.use('/users', usersRouter);

// Project management routes
router.use('/projects', projectsRouter);

// Add more route modules here
// etc.

export default router;
