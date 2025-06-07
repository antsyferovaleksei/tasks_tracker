import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
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

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .insert([
        {
          ...validatedData,
          user_id: userId,
        }
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Create project error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating project',
      });
    }

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

    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .eq('archived', archived === 'true')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get projects error:', error);
      return res.status(500).json({
        success: false,
        message: 'Помилка отримання projectів',
      });
    }

    res.json({
      success: true,
      data: projects || [],
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

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !project) {
      return res.status(404).json({
        success: false,
        message: 'Project не знайдено',
      });
    }

    // Отримуємо задачі проекту
    const { data: tasks } = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false });

    res.json({
      success: true,
      data: {
        ...project,
        tasks: tasks || []
      },
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
    const { data: existingProject } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project не знайдено',
      });
    }

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .update(validatedData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Update project error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating project',
      });
    }

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
    const { data: existingProject } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: 'Project не знайдено',
      });
    }

    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete project error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting project',
      });
    }

    res.json({
      success: true,
      message: 'Project успішно видалено',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка видалення projectу',
    });
  }
}; 