import { Router } from 'express';
import healthRouter from './health.js';
import authRouter from './auth.js';

const router = Router();

// Health check route
router.use('/health', healthRouter);

// Authentication routes
router.use('/auth', authRouter);

// Add more route modules here
// router.use('/users', usersRouter);
// etc.

export default router;
