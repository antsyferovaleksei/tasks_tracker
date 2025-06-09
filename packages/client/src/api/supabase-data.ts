import { supabase } from './supabase-auth';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  archived: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  project_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Допоміжна функція для забезпечення існування користувача в таблиці users
async function ensureUserExists() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Користувач не авторизований');

  try {
    // Перевіряємо чи існує користувач в таблиці users
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    // Якщо користувач не знайдений, створюємо його
    if (checkError && checkError.code === 'PGRST116') {
      console.log('Creating user in users table:', user.email);
      
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          email: user.email || '',
                      name: user.user_metadata?.name || (user as any).raw_user_meta_data?.name || 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (insertError) {
        console.error('Error creating user in users table:', insertError);
        // Не кидаємо помилку, продовжуємо роботу
      } else {
        console.log('User created successfully in users table');
      }
    } else if (checkError) {
      console.error('Error checking user existence:', checkError);
      // Не кидаємо помилку, продовжуємо роботу
    }
  } catch (error) {
    console.error('ensureUserExists error:', error);
    // Не кидаємо помилку, щоб не зламати основну функціональність
  }

  return user;
}

export const projectsService = {
  // Створити проект
  async createProject(projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    // Спочатку створюємо користувача в таблиці users якщо його немає
    await ensureUserExists();

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        ...projectData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Отримати всі проекти користувача
  async getProjects() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    // Спочатку створюємо користувача в таблиці users якщо його немає
    await ensureUserExists();

    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        tasks(count)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Перетворюємо відповідь, щоб включити _count
    const projectsWithCount = (data || []).map(project => ({
      ...project,
      _count: {
        tasks: project.tasks?.[0]?.count || 0
      }
    }));
    
    return projectsWithCount;
  },

  // Оновити проект
  async updateProject(id: string, updates: Partial<Project>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    const { data, error } = await supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Видалити проект
  async deleteProject(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }
};

export const tasksService = {
  // Створити завдання
  async createTask(taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...taskData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Отримати завдання
  async getTasks(projectId?: string, page = 1, limit = 20) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return data || [];
  },

  // Оновити завдання
  async updateTask(id: string, updates: Partial<Task>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Видалити завдання
  async deleteTask(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  }
};

// Time Entries Service
export const timeEntriesService = {
  // Створити time entry
  async createTimeEntry(entryData: {
    taskId: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    duration?: number;
    isRunning: boolean;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    const { data, error } = await supabase
      .from('time_entries')
      .insert([{
        task_id: entryData.taskId,
        user_id: user.id,
        description: entryData.description || '',
        start_time: entryData.startTime ? new Date(entryData.startTime).toISOString() : new Date().toISOString(),
        end_time: entryData.endTime ? new Date(entryData.endTime).toISOString() : null,
        duration: entryData.duration || null,
        is_running: entryData.isRunning,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Отримати активний таймер
  async getActiveTimer() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    const { data, error } = await supabase
      .from('time_entries')
      .select(`
        *,
        tasks (
          id,
          title,
          project_id,
          projects (
            id,
            name,
            color
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('is_running', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Запустити таймер
  async startTimer(taskId: string, description?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    // Спочатку зупиняємо всі активні таймери
    await supabase
      .from('time_entries')
      .update({
        is_running: false,
        end_time: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('is_running', true);

    // Змінюємо статус завдання на 'in_progress' якщо воно не в цьому статусі
    await supabase
      .from('tasks')
      .update({
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .eq('user_id', user.id)
      .in('status', ['todo', 'done']);

    // Створюємо новий активний таймер
    const { data, error } = await supabase
      .from('time_entries')
      .insert([{
        task_id: taskId,
        user_id: user.id,
        description: description || '',
        start_time: new Date().toISOString(),
        is_running: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select(`
        *,
        tasks (
          id,
          title,
          project_id,
          projects (
            id,
            name,
            color
          )
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Зупинити таймер
  async stopTimer(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    const endTime = new Date();
    
    // Отримуємо поточний таймер щоб порахувати тривалість
    const { data: currentTimer } = await supabase
      .from('time_entries')
      .select('start_time')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!currentTimer) throw new Error('Timer не знайдено');

    const startTime = new Date(currentTimer.start_time);
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    const { data, error } = await supabase
      .from('time_entries')
      .update({
        end_time: endTime.toISOString(),
        duration: duration,
        is_running: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        tasks (
          id,
          title,
          project_id,
          projects (
            id,
            name,
            color
          )
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Отримати time entries
  async getTimeEntries(params?: {
    taskId?: string;
    projectId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    let query = supabase
      .from('time_entries')
      .select(`
        *,
        tasks (
          id,
          title,
          project_id,
          projects (
            id,
            name,
            color
          )
        )
      `)
      .eq('user_id', user.id);

    if (params?.taskId) {
      query = query.eq('task_id', params.taskId);
    }

    if (params?.dateFrom) {
      query = query.gte('start_time', params.dateFrom);
    }

    if (params?.dateTo) {
      query = query.lte('start_time', params.dateTo);
    }

    const page = params?.page || 1;
    const limit = params?.limit || 20;

    const { data, error } = await query
      .order('start_time', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;
    return data || [];
  },

  // Оновити time entry
  async updateTimeEntry(id: string, updates: {
    description?: string;
    startTime?: string;
    endTime?: string;
    duration?: number;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.startTime) updateData.start_time = new Date(updates.startTime).toISOString();
    if (updates.endTime) updateData.end_time = new Date(updates.endTime).toISOString();
    if (updates.duration !== undefined) updateData.duration = updates.duration;

    // Якщо оновлюються час початку або кінця, перераховуємо тривалість
    if (updates.startTime || updates.endTime) {
      const currentEntry = await supabase
        .from('time_entries')
        .select('start_time, end_time')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (currentEntry.data) {
        const startTime = new Date(updates.startTime || currentEntry.data.start_time);
        const endTime = new Date(updates.endTime || currentEntry.data.end_time || new Date());
        updateData.duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      }
    }

    const { data, error } = await supabase
      .from('time_entries')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        tasks (
          id,
          title,
          project_id,
          projects (
            id,
            name,
            color
          )
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Видалити time entry
  async deleteTimeEntry(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  },

  // Отримати статистику часу для завдання
  async getTaskTimeStats(taskId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    const { data, error } = await supabase
      .from('time_entries')
      .select('duration, is_running, start_time')
      .eq('task_id', taskId)
      .eq('user_id', user.id);

    if (error) throw error;

    const totalTime = (data || []).reduce((sum: number, entry: any) => {
      if (entry.duration) {
        return sum + entry.duration;
      }
      if (entry.is_running) {
        // Для активних таймерів рахуємо поточний час
        return sum + Math.floor((new Date().getTime() - new Date(entry.start_time).getTime()) / 1000);
      }
      return sum;
    }, 0);

    const entriesCount = data?.length || 0;
    const activeTimer = data?.find((entry: any) => entry.is_running);

    return {
      totalTime,
      entriesCount,
      hasActiveTimer: !!activeTimer,
      activeTimer
    };
  }
};

// Analytics Service
export const analyticsService = {
  // Отримати dashboard метрики
  async getDashboardMetrics(period = 30) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Користувач не авторизований');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Отримуємо базові метрики
    const [tasksResult, timeEntriesResult, projectsResult] = await Promise.all([
      // Всі завдання
      supabase
        .from('tasks')
        .select('id, status, priority, created_at, due_date')
        .eq('user_id', user.id)
        .eq('archived', false),
      
      // Time entries за період
      supabase
        .from('time_entries')
        .select('duration, start_time, task_id')
        .eq('user_id', user.id)
        .gte('start_time', startDate.toISOString()),
      
      // Проекти
      supabase
        .from('projects')
        .select('id')
        .eq('user_id', user.id)
        .eq('archived', false)
    ]);

    if (tasksResult.error) throw tasksResult.error;
    if (timeEntriesResult.error) throw timeEntriesResult.error;
    if (projectsResult.error) throw projectsResult.error;

    const tasks = tasksResult.data || [];
    const timeEntries = timeEntriesResult.data || [];
    const projects = projectsResult.data || [];

    // Розраховуємо метрики
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
    const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;
    const totalTimeSpent = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const projectsCount = projects.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : '0';

    // Статистика по дням
    const dailyStatsMap = new Map();
    tasks.forEach(task => {
      const date = new Date(task.created_at).toISOString().split('T')[0];
      if (!dailyStatsMap.has(date)) {
        dailyStatsMap.set(date, { date, created: 0, completed: 0 });
      }
      const stats = dailyStatsMap.get(date);
      stats.created++;
      if (task.status === 'done') {
        stats.completed++;
      }
    });

    const dailyStats = Array.from(dailyStatsMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    // Статистика по пріоритетам
    const priorityStats = [
      { priority: 'low', count: tasks.filter(t => t.priority === 'low').length },
      { priority: 'medium', count: tasks.filter(t => t.priority === 'medium').length },
      { priority: 'high', count: tasks.filter(t => t.priority === 'high').length }
    ];

    // Статистика по статусам
    const statusStats = [
      { status: 'todo', count: tasks.filter(t => t.status === 'todo').length },
      { status: 'in_progress', count: tasks.filter(t => t.status === 'in_progress').length },
      { status: 'done', count: tasks.filter(t => t.status === 'done').length }
    ];

    return {
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,
        totalTimeSpent,
        projectsCount,
        completionRate
      },
      charts: {
        dailyStats,
        priorityStats,
        statusStats,
        projectTimeStats: [], // Можна додати пізніше
        weekdayStats: [] // Можна додати пізніше
      }
    };
  }
}; 