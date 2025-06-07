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

// All routes require authentication
router.use(authenticateToken);

// Time entry management
router.get('/', getTimeEntries);
router.post('/', createTimeEntry);
router.put('/:id', updateTimeEntry);
router.delete('/:id', deleteTimeEntry);

// Timers
router.get('/active', getActiveTimer);
router.post('/tasks/:taskId/start', startTimer);
router.put('/:id/stop', stopTimer);

// Statistics
router.get('/tasks/:taskId/stats', getTaskTimeStats);

export default router; 