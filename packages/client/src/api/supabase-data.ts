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

  // Перевіряємо чи існує користувач в таблиці users
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    // PGRST116 = row not found, це нормально
    throw checkError;
  }

  // Якщо користувача немає, створюємо його
  if (!existingUser) {
    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || 'User',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (insertError) {
      console.error('Error creating user:', insertError);
      // Не кидаємо помилку, можливо користувач вже існує (race condition)
    }
  }

  return user;
}

export const projectsService = {
  // Створити проект
  async createProject(projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    const user = await ensureUserExists();

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
    const user = await ensureUserExists();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
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