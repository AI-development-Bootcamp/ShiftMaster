import { Router } from 'express';
import { clockIn, clockOut } from '../controllers/entriesController.js';
import { isAuthenticated } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(isAuthenticated);

// Clock-based time tracking routes
router.post('/clock-in', clockIn);
router.patch('/:id/clock-out', clockOut);

export default router;
