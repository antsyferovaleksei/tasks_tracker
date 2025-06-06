import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getReminderSettings,
  updateReminderSettings,
  createScheduledReminder,
  getScheduledReminders,
  scheduleDeadlineReminders,
  deleteReminder,
} from '../controllers/reminderController';

const router = Router();

// Middleware для всіх маршрутів
router.use(authenticateToken);

// Налаштування нагадувань
router.get('/settings', getReminderSettings);
router.put('/settings', updateReminderSettings);

// Заплановані нагадування
router.get('/scheduled', getScheduledReminders);
router.post('/scheduled', createScheduledReminder);
router.delete('/scheduled/:id', deleteReminder);

// Автоматичне планування нагадувань для дедлайнів
router.post('/schedule-deadlines', scheduleDeadlineReminders);

export default router; 