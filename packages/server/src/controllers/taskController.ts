import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createTaskSchema, updateTaskSchema, taskFiltersSchema, paginationSchema } from 'shared/src/validation';
import { AuthRequest } from '../middleware/auth';
// Imported types are now union types, not enums

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createTaskSchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const { tagIds, ...taskData } = validatedData;

    // Create task
    const task = await prisma.task.create({
      data: {
        ...taskData,
        userId,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      },
    });

    // Connect tags if provided
    if (tagIds && tagIds.length > 0) {
      await prisma.taskTag.createMany({
        data: tagIds.map(tagId => ({
          taskId: task.id,
          tagId,
        })),
      });
    }

    // Fetch complete task with relations
    const completeTask = await prisma.task.findUnique({
      where: { id: task.id },
      include: {
        project: true,
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: { timeEntries: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: completeTask,
      message: 'Завдання успішно створено',
    });
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка створення завдання',
    });
  }
};

export const getTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const pagination = paginationSchema.parse(req.query);
    const filters = taskFiltersSchema.parse(req.query);

    const where: any = {
      userId,
    };

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    if (filters.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority };
    }

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
        {
          project: {
            name: { contains: filters.search }
          }
        },
        {
          tags: {
            some: {
              tag: {
                name: { contains: filters.search }
              }
            }
          }
        }
      ];
    }

    if (filters.archived !== undefined) {
      where.archived = filters.archived;
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) {
        where.dueDate.gte = new Date(filters.dueDateFrom);
      }
      if (filters.dueDateTo) {
        where.dueDate.lte = new Date(filters.dueDateTo);
      }
    }

    if (filters.tagIds && filters.tagIds.length > 0) {
      where.tags = {
        some: {
          tagId: { in: filters.tagIds },
        },
      };
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          project: true,
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: { timeEntries: true },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
      prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(total / pagination.limit);

    res.json({
      success: true,
      data: {
        data: tasks,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка отримання завдань',
    });
  }
};

export const getTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const task = await prisma.task.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        project: true,
        tags: {
          include: {
            tag: true,
          },
        },
        timeEntries: {
          orderBy: {
            startTime: 'desc',
          },
        },
        _count: {
          select: { timeEntries: true },
        },
      },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Завдання не знайдено',
      });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання завдання',
    });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const validatedData = updateTaskSchema.parse(req.body);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Завдання не знайдено',
      });
    }

    const { tagIds, ...taskData } = validatedData;

    // Update task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined,
        completedAt: taskData.status === 'COMPLETED' && existingTask.status !== 'COMPLETED'
          ? new Date()
          : taskData.status !== 'COMPLETED' && existingTask.status === 'COMPLETED'
          ? null
          : undefined,
      },
    });

    // Update tags if provided
    if (tagIds !== undefined) {
      // Remove existing tags
      await prisma.taskTag.deleteMany({
        where: { taskId: id },
      });

      // Add new tags
      if (tagIds.length > 0) {
        await prisma.taskTag.createMany({
          data: tagIds.map(tagId => ({
            taskId: id,
            tagId,
          })),
        });
      }
    }

    // Fetch complete updated task
    const completeTask = await prisma.task.findUnique({
      where: { id },
      include: {
        project: true,
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: { timeEntries: true },
        },
      },
    });

    res.json({
      success: true,
      data: completeTask,
      message: 'Завдання успішно оновлено',
    });
  } catch (error: any) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка оновлення завдання',
    });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Check if task exists and belongs to user
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Завдання не знайдено',
      });
    }

    await prisma.task.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Завдання успішно видалено',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка видалення завдання',
    });
  }
};

export const duplicateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Get original task with tags
    const originalTask = await prisma.task.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!originalTask) {
      return res.status(404).json({
        success: false,
        message: 'Завдання не знайдено',
      });
    }

    // Create duplicate task
    const duplicateTask = await prisma.task.create({
      data: {
        title: `${originalTask.title} (копія)`,
        description: originalTask.description,
        priority: originalTask.priority,
        dueDate: originalTask.dueDate,
        projectId: originalTask.projectId,
        userId,
        status: 'TODO', // Reset status to TODO
      },
    });

    // Copy tags
    if (originalTask.tags.length > 0) {
      await prisma.taskTag.createMany({
        data: originalTask.tags.map((taskTag: any) => ({
          taskId: duplicateTask.id,
          tagId: taskTag.tagId,
        })),
      });
    }

    // Fetch complete duplicated task
    const completeTask = await prisma.task.findUnique({
      where: { id: duplicateTask.id },
      include: {
        project: true,
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: { timeEntries: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: completeTask,
      message: 'Завдання успішно дубльовано',
    });
  } catch (error) {
    console.error('Duplicate task error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка дублювання завдання',
    });
  }
}; 