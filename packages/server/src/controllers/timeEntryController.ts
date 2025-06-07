import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createTimeEntrySchema, updateTimeEntrySchema, timeEntryFiltersSchema, paginationSchema } from 'shared/src/validation';
import { AuthRequest } from '../middleware/auth';

// Creating new time entry (manual input)
export const createTimeEntry = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createTimeEntrySchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Check if task exists and belongs to user
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

    const timeEntry = await prisma.timeEntry.create({
      data: {
        ...validatedData,
        userId,
        startTime: validatedData.startTime ? new Date(validatedData.startTime) : new Date(),
        endTime: validatedData.endTime ? new Date(validatedData.endTime) : null,
        duration: validatedData.duration || null,
        isRunning: false,
      },
      include: {
        task: {
          include: {
            project: true,
          },
        },
      },
    });

    // Automatically change task status from TODO to IN_PROGRESS when adding time
    if (task.status === 'TODO' && (validatedData.duration || 0) > 0) {
      await prisma.task.update({
        where: { id: validatedData.taskId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    res.status(201).json({
      success: true,
      data: timeEntry,
      message: 'Запис часу успішно створено',
    });
  } catch (error: any) {
    console.error('Create time entry error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Creation error запису часу',
    });
  }
};

// Start timer for task
export const startTimer = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const { description } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Check if task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tasks не знайдено',
      });
    }

    // Stop all user active timers
    await prisma.timeEntry.updateMany({
      where: {
        userId,
        isRunning: true,
      },
      data: {
        isRunning: false,
        endTime: new Date(),
      },
    });

    // Update duration for stopped timers
    const stoppedEntries = await prisma.timeEntry.findMany({
      where: {
        userId,
        endTime: { not: null },
        duration: null,
      },
    });

    for (const entry of stoppedEntries) {
      if (entry.endTime) {
        const duration = Math.floor((entry.endTime.getTime() - entry.startTime.getTime()) / 1000);
        await prisma.timeEntry.update({
          where: { id: entry.id },
          data: { duration },
        });
      }
    }

    // Create new entry with started timer
    const timeEntry = await prisma.timeEntry.create({
      data: {
        taskId,
        userId,
        description: description || '',
        startTime: new Date(),
        isRunning: true,
      },
      include: {
        task: {
          include: {
            project: true,
          },
        },
      },
    });

    // Automatically change task status from TODO to IN_PROGRESS on first timer start
    if (task.status === 'TODO') {
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    res.status(201).json({
      success: true,
      data: timeEntry,
      message: 'Таймер запущено',
    });
  } catch (error: any) {
    console.error('Start timer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка запуску таймера',
    });
  }
};

// Stop timer
export const stopTimer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Find active time entry with task information
    const timeEntry = await prisma.timeEntry.findFirst({
      where: {
        id,
        userId,
        isRunning: true,
      },
      include: {
        task: true,
      },
    });

    if (!timeEntry) {
      return res.status(404).json({
        success: false,
        message: 'Active Timer не знайдено',
      });
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - timeEntry.startTime.getTime()) / 1000);

    // Automatically change task status from TODO to IN_PROGRESS when stopping timer with spent time
    if (timeEntry.task.status === 'TODO' && duration > 0) {
      await prisma.task.update({
        where: { id: timeEntry.taskId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    const updatedEntry = await prisma.timeEntry.update({
      where: { id },
      data: {
        endTime,
        duration,
        isRunning: false,
      },
      include: {
        task: {
          include: {
            project: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedEntry,
      message: 'Таймер зупинено',
    });
  } catch (error: any) {
    console.error('Stop timer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка зупинки таймера',
    });
  }
};

// Getting current active timer
export const getActiveTimer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const activeTimer = await prisma.timeEntry.findFirst({
      where: {
        userId,
        isRunning: true,
      },
      include: {
        task: {
          include: {
            project: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: activeTimer,
    });
  } catch (error: any) {
    console.error('Get active timer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка отримання активного таймера',
    });
  }
};

// Getting time entries with filtering
export const getTimeEntries = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const pagination = paginationSchema.parse(req.query);
    const filters = timeEntryFiltersSchema.parse(req.query);

    const where: any = {
      userId,
    };

    // Apply filters
    if (filters.taskId) {
      where.taskId = filters.taskId;
    }

    if (filters.projectId) {
      where.task = {
        projectId: filters.projectId,
      };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.startTime = {};
      if (filters.dateFrom) {
        where.startTime.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.startTime.lte = new Date(filters.dateTo);
      }
    }

    const [timeEntries, total] = await Promise.all([
      prisma.timeEntry.findMany({
        where,
        include: {
          task: {
            include: {
              project: true,
            },
          },
        },
        orderBy: {
          startTime: 'desc',
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.timeEntry.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pagination.limit);

    res.json({
      success: true,
      data: {
        data: timeEntries,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Get time entries error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка отримання записів часу',
    });
  }
};

// Update time entry
export const updateTimeEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateTimeEntrySchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Check if entry exists and belongs to user
    const existingEntry = await prisma.timeEntry.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: 'Запис часу не знайдено',
      });
    }

    const updateData: any = {};

    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description;
    }

    if (validatedData.startTime) {
      updateData.startTime = new Date(validatedData.startTime);
    }

    if (validatedData.endTime) {
      updateData.endTime = new Date(validatedData.endTime);
    }

    if (validatedData.duration !== undefined) {
      updateData.duration = validatedData.duration;
    }

    // If updating startTime or endTime, recalculate duration
    if (updateData.startTime || updateData.endTime) {
      const startTime = updateData.startTime || existingEntry.startTime;
      const endTime = updateData.endTime || existingEntry.endTime;
      
      if (startTime && endTime) {
        updateData.duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      }
    }

    const timeEntry = await prisma.timeEntry.update({
      where: { id },
      data: updateData,
      include: {
        task: {
          include: {
            project: true,
          },
        },
      },
    });

    // Automatically change task status from TODO to IN_PROGRESS when updating time
    if (timeEntry.task.status === 'TODO' && (timeEntry.duration || 0) > 0) {
      await prisma.task.update({
        where: { id: timeEntry.taskId },
        data: { status: 'IN_PROGRESS' },
      });
    }

    res.json({
      success: true,
      data: timeEntry,
      message: 'Запис часу успішно оновлено',
    });
  } catch (error: any) {
    console.error('Update time entry error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Update error запису часу',
    });
  }
};

// Delete time entry
export const deleteTimeEntry = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Check if entry exists and belongs to user
    const existingEntry = await prisma.timeEntry.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingEntry) {
      return res.status(404).json({
        success: false,
        message: 'Запис часу не знайдено',
      });
    }

    await prisma.timeEntry.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Запис часу успішно видалено',
    });
  } catch (error: any) {
    console.error('Delete time entry error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Deletion error запису часу',
    });
  }
};

// Get time statistics for task
export const getTaskTimeStats = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Check if task exists and belongs to user
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        userId,
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tasks не знайдено',
      });
    }

    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        taskId,
        userId,
      },
    });

    const totalTime = timeEntries.reduce((sum: number, entry: any) => {
      if (entry.duration) {
        return sum + entry.duration;
      }
      if (entry.isRunning) {
        // For running timers calculate current time
        return sum + Math.floor((new Date().getTime() - entry.startTime.getTime()) / 1000);
      }
      return sum;
    }, 0);

    const entriesCount = timeEntries.length;
    const activeTimer = timeEntries.find((entry: any) => entry.isRunning);

    res.json({
      success: true,
      data: {
        totalTime,
        entriesCount,
        hasActiveTimer: !!activeTimer,
        activeTimer,
      },
    });
  } catch (error: any) {
    console.error('Get task time stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка отримання статистики часу',
    });
  }
}; 