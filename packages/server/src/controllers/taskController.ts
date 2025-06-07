import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
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
    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .insert([
        {
          ...taskData,
          user_id: userId,
          due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
          project_id: taskData.projectId || null,
        }
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Create task error:', error);
      return res.status(500).json({
        success: false,
        message: 'Creation error task',
      });
    }

    // Connect tags if provided
    if (tagIds && tagIds.length > 0) {
      const tagConnections = tagIds.map(tagId => ({
        task_id: task.id,
        tag_id: tagId,
      }));

      await supabaseAdmin
        .from('task_tags')
        .insert(tagConnections);
    }

    // Fetch complete task with relations
    const { data: completeTask } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        projects(*),
        task_tags(tags(*))
      `)
      .eq('id', task.id)
      .single();

    res.status(201).json({
      success: true,
      data: completeTask,
      message: 'Tasks успішно створено',
    });
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Creation error task',
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

    let query = supabaseAdmin
      .from('tasks')
      .select(`
        *,
        projects(*),
        task_tags(tags(*))
      `)
      .eq('user_id', userId);

    // Apply filters
    if (filters.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters.priority && filters.priority.length > 0) {
      query = query.in('priority', filters.priority);
    }

    if (filters.projectId) {
      query = query.eq('project_id', filters.projectId);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.archived !== undefined) {
      query = query.eq('archived', filters.archived);
    }

    if (filters.dueDateFrom) {
      query = query.gte('due_date', new Date(filters.dueDateFrom).toISOString());
    }

    if (filters.dueDateTo) {
      query = query.lte('due_date', new Date(filters.dueDateTo).toISOString());
    }

    // Add pagination
    const offset = (pagination.page - 1) * pagination.limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pagination.limit - 1);

    const { data: tasks, error, count } = await query;

    if (error) {
      console.error('Get tasks error:', error);
      return res.status(500).json({
        success: false,
        message: 'Помилка отримання tasks',
      });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / pagination.limit);

    res.json({
      success: true,
      data: {
        data: tasks || [],
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
      message: error.message || 'Помилка отримання tasks',
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

    const { data: task, error } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        projects(*),
        task_tags(tags(*))
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error || !task) {
      return res.status(404).json({
        success: false,
        message: 'Task не знайдено',
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
      message: 'Помилка отримання task',
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
    const existingTask = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Tasks не знайдено',
      });
    }

    const { tagIds, ...taskData } = validatedData;

    // Update task
    const { data: updatedTask, error } = await supabaseAdmin
      .from('tasks')
      .update({
        ...taskData,
        due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : undefined,
        completed_at: taskData.status === 'COMPLETED' && existingTask.data?.status !== 'COMPLETED'
          ? new Date().toISOString()
          : taskData.status !== 'COMPLETED' && existingTask.data?.status === 'COMPLETED'
          ? null
          : undefined,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('Update task error:', error);
      return res.status(500).json({
        success: false,
        message: 'Update error task',
      });
    }

    // Update tags if provided
    if (tagIds !== undefined) {
      // Remove existing tags
      await supabaseAdmin
        .from('task_tags')
        .delete()
        .eq('task_id', id);

      // Add new tags
      if (tagIds.length > 0) {
        const tagConnections = tagIds.map(tagId => ({
          task_id: id,
          tag_id: tagId,
        }));

        await supabaseAdmin
          .from('task_tags')
          .insert(tagConnections);
      }
    }

    // Fetch complete updated task
    const { data: completeTask } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        projects(*),
        task_tags(tags(*))
      `)
      .eq('id', updatedTask.id)
      .single();

    res.json({
      success: true,
      data: completeTask,
      message: 'Tasks успішно оновлено',
    });
  } catch (error: any) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Update error task',
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
    const existingTask = await supabaseAdmin
      .from('tasks')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: 'Tasks не знайдено',
      });
    }

    await supabaseAdmin
      .from('tasks')
      .delete()
      .eq('id', id);

    res.json({
      success: true,
      message: 'Tasks успішно видалено',
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Deletion error task',
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
    const { data: originalTask } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        projects(*),
        task_tags(tags(*))
      `)
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!originalTask) {
      return res.status(404).json({
        success: false,
        message: 'Tasks не знайдено',
      });
    }

    // Create duplicate task
    const { data: duplicateTask, error } = await supabaseAdmin
      .from('tasks')
      .insert([
        {
          title: `${originalTask.title} (копія)`,
          description: originalTask.description,
          priority: originalTask.priority,
          due_date: originalTask.due_date,
          project_id: originalTask.project_id,
          user_id: userId,
          status: 'TODO', // Reset status to TODO
        }
      ])
      .select('*')
      .single();

    if (error) {
      console.error('Duplicate task error:', error);
      return res.status(500).json({
        success: false,
        message: 'Помилка дублювання task',
      });
    }

    // Copy tags
    if (originalTask.task_tags.length > 0) {
      const tagConnections = originalTask.task_tags.map((taskTag: any) => ({
        task_id: duplicateTask.id,
        tag_id: taskTag.tag_id,
      }));

      await supabaseAdmin
        .from('task_tags')
        .insert(tagConnections);
    }

    // Fetch complete duplicated task
    const { data: completeTask } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        projects(*),
        task_tags(tags(*))
      `)
      .eq('id', duplicateTask.id)
      .single();

    res.status(201).json({
      success: true,
      data: completeTask,
      message: 'Tasks успішно дубльовано',
    });
  } catch (error) {
    console.error('Duplicate task error:', error);
    res.status(500).json({
      success: false,
      message: 'Помилка дублювання task',
    });
  }
}; 