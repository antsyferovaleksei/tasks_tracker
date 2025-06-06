import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { createTagSchema, updateTagSchema } from 'shared/src/validation';
import { AuthRequest } from '../middleware/auth';

export const createTag = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createTagSchema.parse(req.body);

    // Check if tag with this name already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name: validatedData.name },
    });

    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Тег з такою назвою вже існує',
      });
    }

    const tag = await prisma.tag.create({
      data: validatedData,
    });

    res.status(201).json({
      success: true,
      data: tag,
      message: 'Тег успішно створено',
    });
  } catch (error: any) {
    console.error('Create tag error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка створення тегу',
    });
  }
};

export const getTags = async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання тегів',
    });
  }
};

export const getTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Тег не знайдено',
      });
    }

    res.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error('Get tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання тегу',
    });
  }
};

export const updateTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateTagSchema.parse(req.body);

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return res.status(404).json({
        success: false,
        message: 'Тег не знайдено',
      });
    }

    // Check if new name already exists (if name is being changed)
    if (validatedData.name && validatedData.name !== existingTag.name) {
      const nameExists = await prisma.tag.findUnique({
        where: { name: validatedData.name },
      });

      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Тег з такою назвою вже існує',
        });
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: validatedData,
    });

    res.json({
      success: true,
      data: tag,
      message: 'Тег успішно оновлено',
    });
  } catch (error: any) {
    console.error('Update tag error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Помилка оновлення тегу',
    });
  }
};

export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Check if tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    });

    if (!existingTag) {
      return res.status(404).json({
        success: false,
        message: 'Тег не знайдено',
      });
    }

    await prisma.tag.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Тег успішно видалено',
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка видалення тегу',
    });
  }
}; 