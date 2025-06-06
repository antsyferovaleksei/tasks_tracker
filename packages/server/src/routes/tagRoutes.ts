import { Router } from 'express';
import { 
  createTag, 
  getTags, 
  getTag, 
  updateTag, 
  deleteTag 
} from '../controllers/tagController';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes (tags can be viewed by anyone)
router.get('/', getTags);
router.get('/:id', getTag);

// Protected routes (only authenticated users can modify tags)
router.post('/', authenticateToken, createTag);
router.put('/:id', authenticateToken, updateTag);
router.delete('/:id', authenticateToken, deleteTag);

export default router; 