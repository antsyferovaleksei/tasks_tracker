import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  saveFilter,
  getUserFilters,
  deleteFilter,
  getQuickFilters,
} from '../controllers/filterController';

const router = Router();

// Всі маршрути потребують аутентифікації
router.use(authenticateToken);

// Збережені фільтри користувача
router.get('/', getUserFilters);
router.post('/', saveFilter);
router.delete('/:id', deleteFilter);

// Швидкі фільтри
router.get('/quick', getQuickFilters);

export default router; 