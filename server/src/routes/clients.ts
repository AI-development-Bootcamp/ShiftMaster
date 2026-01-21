
import { Router } from 'express';
import { listClients, createClient, updateClient, deleteClient } from '../controllers/clientsController.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = Router();

router.use(isAuthenticated, isAdmin);

router.get('/', listClients);
router.post('/', createClient);
router.patch('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
