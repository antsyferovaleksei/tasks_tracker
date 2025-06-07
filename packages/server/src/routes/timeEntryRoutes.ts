import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createTimeEntry,
  startTimer,
  stopTimer,
  getActiveTimer,
  getTimeEntries,
  updateTimeEntry,
  deleteTimeEntry,
  getTaskTimeStats,
} from '../controllers/timeEntryController';

const router = Router();

// All маршрути потребують аутентифікації
router.use(authenticateToken);

// Управління записами часу
router.get('/', getTimeEntries);
router.post('/', createTimeEntry);
router.put('/:id', updateTimeEntry);
router.delete('/:id', deleteTimeEntry);

// Таймери
router.get('/active', getActiveTimer);
router.post('/tasks/:taskId/start', startTimer);
router.put('/:id/stop', stopTimer);

// Статистика
router.get('/tasks/:taskId/stats', getTaskTimeStats);

export default router; 