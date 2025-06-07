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

// Middleware for all routes
router.use(authenticateToken);

// Reminder settings
router.get('/settings', getReminderSettings);
router.put('/settings', updateReminderSettings);

// Scheduled reminders
router.get('/scheduled', getScheduledReminders);
router.post('/scheduled', createScheduledReminder);
router.delete('/scheduled/:id', deleteReminder);

// Automatic scheduling of reminders for deadlines
router.post('/schedule-deadlines', scheduleDeadlineReminders);

export default router; 