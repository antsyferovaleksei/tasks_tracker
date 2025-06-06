import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';

// Схема для збереження фільтру
const saveFilterSchema = z.object({
  name: z.string().min(1, 'Назва фільтру обов\'язкова'),
  filters: z.object({
    status: z.array(z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])).optional(),
    priority: z.array(z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])).optional(),
    projectId: z.string().optional(),
    tagIds: z.array(z.string()).optional(),
    search: z.string().optional(),
    archived: z.boolean().optional(),
    dueDateFrom: z.string().datetime().optional(),
    dueDateTo: z.string().datetime().optional(),
  }),
});

// Збереження користувацького фільтру
export const saveFilter = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = saveFilterSchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Перевіряємо, чи не існує фільтр з такою назвою
    const existingFilter = await prisma.userFilter.findFirst({
      where: {
        userId,
        name: validatedData.name,
      },
    });

    if (existingFilter) {
      return res.status(409).json({
        success: false,
        message: 'Фільтр з такою назвою вже існує',
      });
    }

    const filter = await prisma.userFilter.create({
      data: {
        name: validatedData.name,
        filters: JSON.stringify(validatedData.filters),
        userId,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        ...filter,
        filters: JSON.parse(filter.filters),
      },
      message: 'Фільтр успішно збережено',
    });
  } catch (error: any) {
    console.error('Save filter error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка збереження фільтру',
    });
  }
};

// Отримання збережених фільтрів користувача
export const getUserFilters = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const filters = await prisma.userFilter.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const formattedFilters = filters.map((filter: any) => ({
      ...filter,
      filters: JSON.parse(filter.filters),
    }));

    res.json({
      success: true,
      data: formattedFilters,
    });
  } catch (error: any) {
    console.error('Get user filters error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка отримання фільтрів',
    });
  }
};

// Видалення збереженого фільтру
export const deleteFilter = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const filter = await prisma.userFilter.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!filter) {
      return res.status(404).json({
        success: false,
        message: 'Фільтр не знайдено',
      });
    }

    await prisma.userFilter.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Фільтр успішно видалено',
    });
  } catch (error: any) {
    console.error('Delete filter error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка видалення фільтру',
    });
  }
};

// Швидкі фільтри
export const getQuickFilters = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Отримуємо кількість завдань для швидких фільтрів
    const [
      todoCount,
      inProgressCount,
      completedCount,
      overDueCount,
      todayCount,
      thisWeekCount,
      highPriorityCount,
    ] = await Promise.all([
      prisma.task.count({
        where: { userId, status: 'TODO', archived: false },
      }),
      prisma.task.count({
        where: { userId, status: 'IN_PROGRESS', archived: false },
      }),
      prisma.task.count({
        where: { userId, status: 'COMPLETED', archived: false },
      }),
      prisma.task.count({
        where: {
          userId,
          dueDate: { lt: new Date() },
          status: { not: 'COMPLETED' },
          archived: false,
        },
      }),
      prisma.task.count({
        where: {
          userId,
          dueDate: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
          archived: false,
        },
      }),
      prisma.task.count({
        where: {
          userId,
          dueDate: {
            gte: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
            lt: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 7)),
          },
          archived: false,
        },
      }),
      prisma.task.count({
        where: { userId, priority: 'HIGH', archived: false },
      }),
    ]);

    const quickFilters = [
      {
        id: 'todo',
        name: 'До виконання',
        count: todoCount,
        filters: { status: ['TODO'] },
      },
      {
        id: 'in_progress',
        name: 'В роботі',
        count: inProgressCount,
        filters: { status: ['IN_PROGRESS'] },
      },
      {
        id: 'completed',
        name: 'Завершені',
        count: completedCount,
        filters: { status: ['COMPLETED'] },
      },
      {
        id: 'overdue',
        name: 'Прострочені',
        count: overDueCount,
        filters: { 
          status: ['TODO', 'IN_PROGRESS'],
          dueDateTo: new Date().toISOString(),
        },
      },
      {
        id: 'today',
        name: 'Сьогодні',
        count: todayCount,
        filters: {
          dueDateFrom: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
          dueDateTo: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
        },
      },
      {
        id: 'this_week',
        name: 'Цей тиждень',
        count: thisWeekCount,
        filters: {
          dueDateFrom: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString(),
          dueDateTo: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 7)).toISOString(),
        },
      },
      {
        id: 'high_priority',
        name: 'Високий пріоритет',
        count: highPriorityCount,
        filters: { priority: ['HIGH', 'URGENT'] },
      },
    ];

    res.json({
      success: true,
      data: quickFilters,
    });
  } catch (error: any) {
    console.error('Get quick filters error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка отримання швидких фільтрів',
    });
  }
}; 