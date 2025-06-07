import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import * as cron from 'node-cron';

// Схема для налаштувань нагадувань
const reminderSettingsSchema = z.object({
  emailReminders: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  reminderFrequency: z.enum(['DAILY', 'WEEKLY', 'CUSTOM']).optional(),
  daysBeforeDeadline: z.number().min(0).max(30).optional(),
  customReminderTimes: z.array(z.string()).optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  weekendReminders: z.boolean().optional(),
});

// Схема для створення нагадування
const createReminderSchema = z.object({
  type: z.enum(['EMAIL', 'PUSH']),
  scheduledFor: z.string().datetime(),
  title: z.string().min(1),
  message: z.string().min(1),
  taskId: z.string().optional(),
  metadata: z.object({}).optional(),
});

// Email транспортер (в production використовуйте реальні налаштування)
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'test@example.com',
    pass: process.env.SMTP_PASS || 'password',
  },
});

// Отримання налаштувань нагадувань користувача
export const getReminderSettings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    let settings = await prisma.reminderSettings.findUnique({
      where: { userId },
    });

    // Якщо налаштувань немає, створюємо значення за замовчуванням
    if (!settings) {
      settings = await prisma.reminderSettings.create({
        data: { userId },
      });
    }

    res.json({
      success: true,
      data: {
        ...settings,
        customReminderTimes: settings.customReminderTimes 
          ? JSON.parse(settings.customReminderTimes) 
          : [],
      },
    });
  } catch (error: any) {
    console.error('Get reminder settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка отримання налаштувань нагадувань',
    });
  }
};

// Оновлення налаштувань нагадувань
export const updateReminderSettings = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = reminderSettingsSchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const updateData: any = { ...validatedData };

    if (validatedData.customReminderTimes) {
      updateData.customReminderTimes = JSON.stringify(validatedData.customReminderTimes);
    }

    const settings = await prisma.reminderSettings.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
    });

    res.json({
      success: true,
      data: {
        ...settings,
        customReminderTimes: settings.customReminderTimes 
          ? JSON.parse(settings.customReminderTimes) 
          : [],
      },
      message: 'Settings нагадувань оновлено',
    });
  } catch (error: any) {
    console.error('Update reminder settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Update error налаштувань нагадувань',
    });
  }
};

// Створення запланованого нагадування
export const createScheduledReminder = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createReminderSchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Перевіряємо, чи існує task (якщо вказано)
    if (validatedData.taskId) {
      const task = await prisma.task.findFirst({
        where: {
          id: validatedData.taskId,
          userId,
        },
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Tasks не знайдено',
        });
      }
    }

    const reminder = await prisma.scheduledReminder.create({
      data: {
        ...validatedData,
        scheduledFor: new Date(validatedData.scheduledFor),
        metadata: validatedData.metadata ? JSON.stringify(validatedData.metadata) : null,
        userId,
      },
      include: {
        task: true,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...reminder,
        metadata: reminder.metadata ? JSON.parse(reminder.metadata) : null,
      },
      message: 'Нагадування заплановано',
    });
  } catch (error: any) {
    console.error('Create scheduled reminder error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Creation error нагадування',
    });
  }
};

// Отримання запланованих нагадувань
export const getScheduledReminders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { type, sent, upcoming } = req.query;

    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    if (sent !== undefined) {
      where.sent = sent === 'true';
    }

    if (upcoming === 'true') {
      where.scheduledFor = { gte: new Date() };
      where.sent = false;
    }

    const reminders = await prisma.scheduledReminder.findMany({
      where,
      include: {
        task: true,
      },
      orderBy: {
        scheduledFor: 'asc',
      },
    });

    const formattedReminders = reminders.map((reminder: any) => ({
      ...reminder,
      metadata: reminder.metadata ? JSON.parse(reminder.metadata) : null,
    }));

    res.json({
      success: true,
      data: formattedReminders,
    });
  } catch (error: any) {
    console.error('Get scheduled reminders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка отримання нагадувань',
    });
  }
};

// Відправка email нагадування
export const sendEmailReminder = async (userId: string, taskId: string, reminder: any) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });

    if (!user || !task) {
      throw new Error('User or task not found');
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@taskstracker.com',
      to: user.email,
      subject: reminder.title,
      html: `
        <h2>${reminder.title}</h2>
        <p>${reminder.message}</p>
        <hr>
        <h3>Деталі task:</h3>
        <p><strong>Task name:</strong> ${task.title}</p>
        ${task.description ? `<p><strong>Description:</strong> ${task.description}</p>` : ''}
        <p><strong>Priority:</strong> ${task.priority}</p>
        <p><strong>Status:</strong> ${task.status}</p>
        ${task.dueDate ? `<p><strong>Дедлайн:</strong> ${new Date(task.dueDate).toLocaleDateString('uk-UA')}</p>` : ''}
        ${task.project ? `<p><strong>Project:</strong> ${task.project.name}</p>` : ''}
        <br>
        <p>З найкращими побажаннями,<br>Tasks Tracker</p>
      `,
    };

    await emailTransporter.sendMail(mailOptions);
    console.log(`Email reminder sent to ${user.email} for task ${task.title}`);
  } catch (error) {
    console.error('Failed to send email reminder:', error);
    throw error;
  }
};

// Автоматичне створення нагадувань для tasks з дедлайнами
export const scheduleDeadlineReminders = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Отримуємо налаштування користувача
    const settings = await prisma.reminderSettings.findUnique({
      where: { userId },
    });

    if (!settings || (!settings.emailReminders && !settings.pushNotifications)) {
      return res.json({
        success: true,
        message: 'Нагадування вимкнені в налаштуваннях',
        data: { created: 0 },
      });
    }

    // Отримуємо task з дедлайнами
    const tasksWithDeadlines = await prisma.task.findMany({
      where: {
        userId,
        dueDate: { not: null },
        status: { not: 'COMPLETED' },
        archived: false,
      },
    });

    let createdReminders = 0;

    for (const task of tasksWithDeadlines) {
      if (!task.dueDate) continue;

      const reminderDate = new Date(task.dueDate);
      reminderDate.setDate(reminderDate.getDate() - settings.daysBeforeDeadline);

      // Перевіряємо, чи не існує вже нагадування для цього task
      const existingReminder = await prisma.scheduledReminder.findFirst({
        where: {
          userId,
          taskId: task.id,
          scheduledFor: reminderDate,
          sent: false,
        },
      });

      if (existingReminder) continue;

      // Створюємо нагадування
      if (settings.emailReminders) {
        await prisma.scheduledReminder.create({
          data: {
            type: 'EMAIL',
            scheduledFor: reminderDate,
            title: `Нагадування: Дедлайн task "${task.title}"`,
            message: `Tasks "${task.title}" має дедлайн ${task.dueDate.toLocaleDateString('uk-UA')}`,
            userId,
            taskId: task.id,
            metadata: JSON.stringify({ daysBeforeDeadline: settings.daysBeforeDeadline }),
          },
        });
        createdReminders++;
      }

      if (settings.pushNotifications) {
        await prisma.scheduledReminder.create({
          data: {
            type: 'PUSH',
            scheduledFor: reminderDate,
            title: `Дедлайн task`,
            message: `"${task.title}" має дедлайн ${task.dueDate.toLocaleDateString('uk-UA')}`,
            userId,
            taskId: task.id,
            metadata: JSON.stringify({ daysBeforeDeadline: settings.daysBeforeDeadline }),
          },
        });
        createdReminders++;
      }
    }

    res.json({
      success: true,
      data: { created: createdReminders },
      message: `Створено ${createdReminders} нагадувань для tasks з дедлайнами`,
    });
  } catch (error: any) {
    console.error('Schedule deadline reminders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка планування нагадувань',
    });
  }
};

// Обробка нагадувань (запускається по cron)
export const processReminders = async () => {
  try {
    const now = new Date();
    
    // Отримуємо нагадування, які потрібно відправити
    const dueReminders = await prisma.scheduledReminder.findMany({
      where: {
        scheduledFor: { lte: now },
        sent: false,
      },
      include: {
        user: true,
        task: true,
      },
    });

    console.log(`Processing ${dueReminders.length} due reminders...`);

    for (const reminder of dueReminders) {
      try {
        if (reminder.type === 'EMAIL' && reminder.taskId) {
          await sendEmailReminder(reminder.userId, reminder.taskId, reminder);
        }

        // Позначаємо як відправлене
        await prisma.scheduledReminder.update({
          where: { id: reminder.id },
          data: { sent: true },
        });

        console.log(`Processed reminder ${reminder.id} for user ${reminder.userId}`);
      } catch (error) {
        console.error(`Failed to process reminder ${reminder.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Process reminders error:', error);
  }
};

// Видалення нагадування
export const deleteReminder = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const reminder = await prisma.scheduledReminder.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Нагадування не знайдено',
      });
    }

    await prisma.scheduledReminder.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Нагадування видалено',
    });
  } catch (error: any) {
    console.error('Delete reminder error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Deletion error нагадування',
    });
  }
};

// Запуск cron job для обробки нагадувань (кожні 5 minutes)
if (process.env.NODE_ENV !== 'test') {
  cron.schedule('*/5 * * * *', () => {
    console.log('Running reminder processing job...');
    processReminders();
  });
} 