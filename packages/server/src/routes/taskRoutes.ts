import { Router } from 'express';
import { 
  createTask, 
  getTasks, 
  getTask, 
  updateTask, 
  deleteTask,
  duplicateTask
} from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All task routes require authentication
router.use(authenticateToken);

router.post('/', createTask);
router.get('/', getTasks);
router.get('/:id', getTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.post('/:id/duplicate', duplicateTask);

export default router; 