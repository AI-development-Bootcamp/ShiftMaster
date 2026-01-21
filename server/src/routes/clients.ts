
import { Router } from 'express';
import { listClients } from '../controllers/clientsController.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = Router();

router.use(isAuthenticated, isAdmin);

router.get('/', listClients);

export default router;
