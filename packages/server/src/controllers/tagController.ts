import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { createTagSchema, updateTagSchema } from 'shared/src/validation';
import { AuthRequest } from '../middleware/auth';

export const createTag = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createTagSchema.parse(req.body);

    const { data: tag, error } = await supabaseAdmin
      .from('tags')
      .insert([validatedData])
      .select('*')
      .single();

    if (error) {
      console.error('Create tag error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating tag',
      });
    }

    res.status(201).json({
      success: true,
      data: tag,
      message: 'Tag успішно створено',
    });
  } catch (error: any) {
    console.error('Create tag error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating tag',
    });
  }
};

export const getTags = async (req: AuthRequest, res: Response) => {
  try {
    const { data: tags, error } = await supabaseAdmin
      .from('tags')
      .select('*')
      .order('name');

    if (error) {
      console.error('Get tags error:', error);
      return res.status(500).json({
        success: false,
        message: 'Помилка отримання tags',
      });
    }

    res.json({
      success: true,
      data: tags || [],
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка отримання tags',
    });
  }
};

export const getTag = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { data: tag, error } = await supabaseAdmin
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag не знайдено',
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
      message: 'Помилка отримання tag',
    });
  }
};

export const updateTag = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateTagSchema.parse(req.body);

    const { data: tag, error } = await supabaseAdmin
      .from('tags')
      .update(validatedData)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag не знайдено',
      });
    }

    res.json({
      success: true,
      data: tag,
      message: 'Tag успішно оновлено',
    });
  } catch (error: any) {
    console.error('Update tag error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating tag',
    });
  }
};

export const deleteTag = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete tag error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting tag',
      });
    }

    res.json({
      success: true,
      message: 'Tag успішно видалено',
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка видалення tag',
    });
  }
}; 