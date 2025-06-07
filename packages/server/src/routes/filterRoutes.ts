import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  saveFilter,
  getUserFilters,
  deleteFilter,
  getQuickFilters,
} from '../controllers/filterController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// User saved filters
router.get('/', getUserFilters);
router.post('/', saveFilter);
router.delete('/:id', deleteFilter);

// Quick filters
router.get('/quick', getQuickFilters);

export default router; 