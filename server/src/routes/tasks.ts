
import { Router } from 'express';
import { listTasks, getAssignments, assignEmployees, getAllAssignments, createTask, updateTask, deleteTask } from '../controllers/tasksController.js';
import { isAuthenticated, isAdmin } from '../middleware/auth.js';

const router = Router();

router.use(isAuthenticated, isAdmin);

router.get('/', listTasks);
router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/assignments', getAllAssignments);
router.get('/:taskId/assignments', getAssignments);
router.post('/:taskId/assignments', assignEmployees);

export default router;
