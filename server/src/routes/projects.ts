
import { Router } from 'express';
import { listProjects } from '../controllers/projectsController.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = Router();

router.use(isAuthenticated, isAdmin);

router.get('/', listProjects);

export default router;
