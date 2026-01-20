import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';
import usersRouter from './users.js';

const router = Router();

// Health check route
router.use('/health', healthRouter);

// Authentication routes
router.use('/auth', authRouter);

// User management routes (admin only)
router.use('/users', usersRouter);

// Add more route modules here
// etc.

export default router;
