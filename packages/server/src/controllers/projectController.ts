import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createProjectSchema, updateProjectSchema } from 'shared/src/validation';
import { AuthRequest } from '../middleware/auth';

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createProjectSchema.parse(req.body);
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        userId,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project успішно створено',
    });
  } catch (error: any) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating project',
    });
  }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { archived = 'false' } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const projects = await prisma.project.findMany({
      where: {
        userId,
        archived: archived === 'true',
      },
      include: {
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання projectів',
    });
  }
};

export const getProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        _count: {
          select: { tasks: true },
        },
        tasks: {
          include: {
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
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project не знайдено',
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання projectу',
    });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const validatedData = updateProjectSchema.parse(req.body);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project не знайдено',
      });
    }

    const project = await prisma.project.update({
      where: { id },
      data: validatedData,
      include: {
        _count: {
          select: { tasks: true },
        },
      },
    });

    res.json({
      success: true,
      data: project,
      message: 'Project успішно оновлено',
    });
  } catch (error: any) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating project',
    });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Check if project exists and belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project не знайдено',
      });
    }

    await prisma.project.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Project успішно видалено',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
    });
  }
}; 