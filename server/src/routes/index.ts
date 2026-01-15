import { Router } from 'express';
import healthRouter from './health.js';

const router = Router();

// Health check route
router.use('/health', healthRouter);

// Add more route modules here
// router.use('/auth', authRouter);
// router.use('/users', usersRouter);
// etc.

export default router;
