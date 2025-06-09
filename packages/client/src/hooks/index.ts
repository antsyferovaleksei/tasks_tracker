import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import apiClient from '../api/client';
import { projectsService, tasksService, timeEntriesService, analyticsService } from '../api/supabase-data';
import {
  User,
  Task,
  Project,
  Tag,
  TimeEntry,
  TimeStats,
  TaskFilters,
  UserFilter,
  QuickFilter,
  Notification,
  ReminderSettings,
  ScheduledReminder,
  DashboardMetrics,
  TimeChartData,
  ProjectReport,
  LoginRequest,
  RegisterRequest,
  ApiResponse,
  PaginatedResponse,
  DeviceInfo,
  TaskStatus,
  TaskPriority
} from '../types';
import { 
  useAuthStore, 
  useTasksStore, 
  useProjectsStore, 
  useTagsStore, 
  useTimeTrackingStore,
  useNotificationsStore,
  useAppSettingsStore,
  useLoadingStore
} from '../store';

// Query Keys
export const queryKeys = {
  auth: {
    profile: ['auth', 'profile'] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    list: (filters?: TaskFilters, page?: number) => ['tasks', 'list', filters, page] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
    search: (query: string) => ['tasks', 'search', query] as const,
  },
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
  },
  tags: {
    all: ['tags'] as const,
  },
  timeEntries: {
    all: ['timeEntries'] as const,
    list: (params?: any) => ['timeEntries', 'list', params] as const,
    active: ['timeEntries', 'active'] as const,
    stats: (taskId: string) => ['timeEntries', 'stats', taskId] as const,
  },
  filters: {
    quick: ['filters', 'quick'] as const,
    user: ['filters', 'user'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    unread: ['notifications', 'unread'] as const,
  },
  reminders: {
    settings: ['reminders', 'settings'] as const,
    scheduled: ['reminders', 'scheduled'] as const,
  },
  analytics: {
    dashboard: (period?: number) => ['analytics', 'dashboard', period] as const,
    timeChart: (params?: any) => ['analytics', 'timeChart', params] as const,
    projects: (params?: any) => ['analytics', 'projects', params] as const,
  },
} as const;

// Device Detection Hook
export const useDeviceDetection = () => {
  const { setDeviceInfo } = useAppSettingsStore();

  const detectDevice = useCallback((): DeviceInfo => {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent;
    
    const isMobile = width <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = width > 768 && width <= 1024;
    const isDesktop = width > 1024;

    return { isMobile, isTablet, isDesktop };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(detectDevice());
    };

    handleResize(); // Initial detection
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [detectDevice, setDeviceInfo]);

  return detectDevice();
};

// Auth Hooks
export const useAuth = () => {
  const { user, isAuthenticated, login, logout, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => apiClient.login(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        login(response.data.user, {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });
        toast.success('Success login!');
        queryClient.invalidateQueries();
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login error');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => {
      console.log('🔄 useAuth: Starting registration API call', data);
      return apiClient.register(data);
    },
    onSuccess: (response) => {
      console.log('✅ useAuth: Registration API call successful', response);
      if (response.success && response.data) {
        console.log('✅ useAuth: Logging in user after successful registration');
        login(response.data.user, {
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });
        toast.success('Success registration!');
        queryClient.invalidateQueries();
      } else {
        console.log('⚠️ useAuth: Registration response missing success or data');
      }
    },
    onError: (error: any) => {
      console.error('❌ useAuth: Registration API call failed', error);
      toast.error(error.response?.data?.message || 'Registration error');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Success logout');
    },
  });

  const profileQuery = useQuery({
    queryKey: queryKeys.auth.profile,
    queryFn: () => apiClient.getProfile(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    updateUser,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    profileData: profileQuery.data?.data,
    isLoadingProfile: profileQuery.isLoading,
  };
};

// Profile Hooks
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();

  return useMutation({
    mutationFn: (data: { name?: string; email?: string }) =>
      apiClient.updateProfile(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        updateUser(response.data);
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile });
        toast.success('Profile successfully updated!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Update error profile');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      apiClient.changePassword(data),
    onSuccess: (response: any) => {
      if (response.success) {
        toast.success('Password successfully changed!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Change password error');
    },
  });
};

// Tasks Hooks
export const useTasks = (filters?: TaskFilters, page = 1, limit = 20) => {
  const { setTasks, setPagination } = useTasksStore();

  const query = useQuery({
    queryKey: queryKeys.tasks.list(filters, page),
    queryFn: async () => {
      // Отримуємо всі завдання
      const allTasks = await tasksService.getTasks(undefined, 1, 1000); // Отримуємо більше завдань для фільтрації
      
      // Фільтруємо на клієнті
      let filteredTasks = allTasks;
      
      if (filters?.projectId) {
        filteredTasks = filteredTasks.filter(task => task.project_id === filters.projectId);
      }
      
      if (filters?.status && filters.status.length > 0) {
        const statusMapping: Record<TaskStatus, string> = {
          'TODO': 'todo',
          'IN_PROGRESS': 'in_progress',
          'COMPLETED': 'done',
          'CANCELLED': 'todo'
        };
        const mappedStatuses = filters.status.map(s => statusMapping[s]);
        filteredTasks = filteredTasks.filter(task => mappedStatuses.includes(task.status));
      }
      
      if (filters?.priority && filters.priority.length > 0) {
        const priorityMapping: Record<TaskPriority, string> = {
          'LOW': 'low',
          'MEDIUM': 'medium',
          'HIGH': 'high',
          'URGENT': 'high'
        };
        const mappedPriorities = filters.priority.map(p => priorityMapping[p]);
        filteredTasks = filteredTasks.filter(task => mappedPriorities.includes(task.priority));
      }
      
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase();
        filteredTasks = filteredTasks.filter(task => 
          task.title.toLowerCase().includes(searchLower) ||
          (task.description && task.description.toLowerCase().includes(searchLower))
        );
      }
      
      // Пагінація
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      return filteredTasks.slice(startIndex, endIndex);
    },
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
  });

  useEffect(() => {
    if (query.data) {
      // Перетворюємо дані з Supabase формату до клієнтського
      const clientTasks = query.data.map((task: any) => ({
        ...task,
        projectId: task.project_id,
        userId: task.user_id,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
        dueDate: task.due_date,
        // Перетворюємо статуси і пріоритети назад
        status: task.status === 'todo' ? 'TODO' : 
                task.status === 'in_progress' ? 'IN_PROGRESS' : 
                task.status === 'done' ? 'COMPLETED' : 'TODO',
        priority: task.priority === 'low' ? 'LOW' :
                  task.priority === 'medium' ? 'MEDIUM' :
                  task.priority === 'high' ? 'HIGH' : 'MEDIUM'
      }));
      
      setTasks(clientTasks);
      
      // Простіша пагінація для Supabase
      const paginationInfo = {
        page,
        limit,
        total: query.data.length,
        totalPages: Math.ceil(query.data.length / limit),
        hasNext: query.data.length === limit,
        hasPrev: page > 1,
      };
      setPagination(paginationInfo);
    }
  }, [query.data, setTasks, setPagination, page, limit]);

  return {
    ...query,
    tasks: query.data ? query.data.map((task: any) => ({
      ...task,
      projectId: task.project_id,
      userId: task.user_id,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      dueDate: task.due_date,
      status: task.status === 'todo' ? 'TODO' : 
              task.status === 'in_progress' ? 'IN_PROGRESS' : 
              task.status === 'done' ? 'COMPLETED' : 'TODO',
      priority: task.priority === 'low' ? 'LOW' :
                task.priority === 'medium' ? 'MEDIUM' :
                task.priority === 'high' ? 'HIGH' : 'MEDIUM'
    })) : [],
    pagination: query.data ? {
      page,
      limit,
      total: query.data.length,
      totalPages: Math.ceil(query.data.length / limit),
      hasNext: query.data.length === limit,
      hasPrev: page > 1,
    } : undefined,
  };
};

export const useTask = (id: string) => {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => apiClient.getTask(id),
    enabled: !!id,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { addTask } = useTasksStore();

  return useMutation({
    mutationFn: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
      // Перетворюємо типи для Supabase
      const statusMapping: Record<TaskStatus, string> = {
        'TODO': 'todo',
        'IN_PROGRESS': 'in_progress', 
        'COMPLETED': 'done',
        'CANCELLED': 'todo'
      };
      
      const priorityMapping: Record<TaskPriority, string> = {
        'LOW': 'low',
        'MEDIUM': 'medium',
        'HIGH': 'high',
        'URGENT': 'high'
      };
      
      const supabaseData = {
        title: data.title,
        description: data.description,
        status: statusMapping[data.status] as 'todo' | 'in_progress' | 'done',
        priority: priorityMapping[data.priority] as 'low' | 'medium' | 'high',
        project_id: data.projectId || '',
        archived: data.archived || false,
        due_date: data.dueDate || null,
      };
      return tasksService.createTask(supabaseData);
    },
    onSuccess: (response) => {
      // Перетворюємо відповідь до формату клієнта
      const clientTask = {
        ...response,
        projectId: response.project_id,
        userId: response.user_id,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        dueDate: response.due_date,
      };
      addTask(clientTask);
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      toast.success('Task created!');
    },
    onError: (error: any) => {
      console.error('Create task error:', error);
      toast.error(error.message || 'Creation error task');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { updateTask } = useTasksStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => {
      // Перетворюємо типи для Supabase
      const statusMapping: Record<TaskStatus, string> = {
        'TODO': 'todo',
        'IN_PROGRESS': 'in_progress', 
        'COMPLETED': 'done',
        'CANCELLED': 'todo'
      };
      
      const priorityMapping: Record<TaskPriority, string> = {
        'LOW': 'low',
        'MEDIUM': 'medium',
        'HIGH': 'high',
        'URGENT': 'high'
      };

      const supabaseData: any = {};
      if (data.title !== undefined) supabaseData.title = data.title;
      if (data.description !== undefined) supabaseData.description = data.description;
      if (data.status !== undefined) supabaseData.status = statusMapping[data.status];
      if (data.priority !== undefined) supabaseData.priority = priorityMapping[data.priority];
      if (data.projectId !== undefined) supabaseData.project_id = data.projectId;
      if (data.archived !== undefined) supabaseData.archived = data.archived;
      if (data.dueDate !== undefined) supabaseData.due_date = data.dueDate;

      return tasksService.updateTask(id, supabaseData);
    },
    onSuccess: (response, variables) => {
      // Перетворюємо відповідь до формату клієнта
      const clientTask = {
        ...response,
        projectId: response.project_id,
        userId: response.user_id,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        dueDate: response.due_date,
      };
      updateTask(variables.id, clientTask);
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      toast.success('Task updated!');
    },
    onError: (error: any) => {
      console.error('Update task error:', error);
      toast.error(error.message || 'Update error task');
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { deleteTask } = useTasksStore();

  return useMutation({
    mutationFn: (id: string) => tasksService.deleteTask(id),
    onSuccess: (_, id) => {
      deleteTask(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      toast.success('Task deleted!');
    },
    onError: (error: any) => {
      console.error('Delete task error:', error);
      toast.error(error.message || 'Deletion error task');
    },
  });
};

export const useSearchTasks = (query: string) => {
  return useQuery({
    queryKey: queryKeys.tasks.search(query),
    queryFn: () => apiClient.searchTasks(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  });
};

// Projects Hooks
export const useProjects = () => {
  const { setProjects } = useProjectsStore();

  const query = useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: () => projectsService.getProjects(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Auto-refetch every minute
  });

  useEffect(() => {
    if (query.data) {
      setProjects(query.data);
    }
  }, [query.data, setProjects]);

  return {
    ...query,
    projects: query.data || [],
  };
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { addProject } = useProjectsStore();

  return useMutation({
    mutationFn: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) =>
      projectsService.createProject(data),
    onSuccess: (data) => {
      if (data) {
        addProject(data);
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
        toast.success('Project created!');
      }
    },
    onError: (error: any) => {
      console.error('Project creation error:', error);
      toast.error(error.message || 'Error creating project');
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { updateProject } = useProjectsStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      projectsService.updateProject(id, data),
    onSuccess: (data, variables) => {
      if (data) {
        updateProject(variables.id, data);
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
        toast.success('Project updated!');
      }
    },
    onError: (error: any) => {
      console.error('Project update error:', error);
      toast.error(error.message || 'Error updating project');
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const { deleteProject } = useProjectsStore();

  return useMutation({
    mutationFn: (id: string) => projectsService.deleteProject(id),
    onSuccess: (_, id) => {
      deleteProject(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success('Project deleted!');
    },
    onError: (error: any) => {
      console.error('Project deletion error:', error);
      toast.error(error.message || 'Error deleting project');
    },
  });
};

// Time Tracking Hooks
export const useActiveTimer = () => {
  const { setActiveTimer } = useTimeTrackingStore();

  const query = useQuery({
    queryKey: queryKeys.timeEntries.active,
    queryFn: () => timeEntriesService.getActiveTimer(),
    refetchInterval: 1000, // Update every second
    staleTime: 0,
  });

  useEffect(() => {
    if (query.data) {
      // Перетворюємо до клієнтського формату
      const activeTimer = query.data ? {
        ...query.data,
        taskId: query.data.task_id,
        userId: query.data.user_id,
        createdAt: query.data.created_at,
        updatedAt: query.data.updated_at,
        startTime: query.data.start_time,
        endTime: query.data.end_time,
        isRunning: query.data.is_running,
        task: query.data.tasks ? {
          ...query.data.tasks,
          projectId: query.data.tasks.project_id,
          userId: query.data.tasks.user_id,
          createdAt: query.data.tasks.created_at,
          updatedAt: query.data.tasks.updated_at
        } : undefined
      } : null;
      setActiveTimer(activeTimer);
    }
  }, [query.data, setActiveTimer]);

  return {
    ...query,
    activeTimer: query.data ? {
      ...query.data,
      taskId: query.data.task_id,
      userId: query.data.user_id,
      createdAt: query.data.created_at,
      updatedAt: query.data.updated_at,
      startTime: query.data.start_time,
      endTime: query.data.end_time,
      isRunning: query.data.is_running,
      task: query.data.tasks ? {
        ...query.data.tasks,
        projectId: query.data.tasks.project_id,
        userId: query.data.tasks.user_id,
        createdAt: query.data.tasks.created_at,
        updatedAt: query.data.tasks.updated_at
      } : undefined
    } : null,
  };
};

export const useStartTimer = () => {
  const queryClient = useQueryClient();
  const { setActiveTimer } = useTimeTrackingStore();

  return useMutation({
    mutationFn: ({ taskId, description }: { taskId: string; description?: string }) =>
      timeEntriesService.startTimer(taskId, description),
    onSuccess: (response) => {
      // Перетворюємо до клієнтського формату
      const activeTimer = {
        ...response,
        taskId: response.task_id,
        userId: response.user_id,
        createdAt: response.created_at,
        updatedAt: response.updated_at,
        startTime: response.start_time,
        endTime: response.end_time,
        isRunning: response.is_running,
        task: response.tasks ? {
          ...response.tasks,
          projectId: response.tasks.project_id,
          userId: response.tasks.user_id,
          createdAt: response.tasks.created_at,
          updatedAt: response.tasks.updated_at
        } : undefined
      };
      
      setActiveTimer(activeTimer);
      // Invalidate all related queries to update the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.active });
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.timeChart() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.projects() });
      toast.success('Timer started!');
    },
    onError: (error: any) => {
      console.error('Start timer error:', error);
      toast.error(error.message || 'Timer start error');
    },
  });
};

export const useStopTimer = () => {
  const queryClient = useQueryClient();
  const { setActiveTimer } = useTimeTrackingStore();

  return useMutation({
    mutationFn: (id: string) => timeEntriesService.stopTimer(id),
    onSuccess: (response) => {
      setActiveTimer(null);
      // Invalidate all related queries to update the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.active });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.timeChart() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.projects() });
      // Also invalidate time stats for all tasks as status might have changed
      queryClient.invalidateQueries({ queryKey: ['timeEntries', 'stats'] });
      toast.success('Timer stopped!');
    },
    onError: (error: any) => {
      console.error('Stop timer error:', error);
      toast.error(error.message || 'Timer stop error');
    },
  });
};

export const useTimeEntries = (params?: {
  taskId?: string;
  projectId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.timeEntries.list(params),
    queryFn: () => apiClient.getTimeEntries(params),
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
  });
};

export const useCreateTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) =>
      timeEntriesService.createTimeEntry({
        taskId: data.taskId,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        duration: data.duration,
        isRunning: data.isRunning
      }),
    onSuccess: (response) => {
      // Invalidate all related queries to update the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.timeChart() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.projects() });
      toast.success('Time entry created!');
    },
    onError: (error: any) => {
      console.error('Create time entry error:', error);
      toast.error(error.message || 'Creation error time entry');
    },
  });
};

export const useUpdateTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TimeEntry> }) =>
      apiClient.updateTimeEntry(id, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        // Invalidate all related queries to update the UI
        queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.stats(response.data.taskId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.dashboard() });
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.timeChart() });
        queryClient.invalidateQueries({ queryKey: queryKeys.analytics.projects() });
        toast.success('Time entry updated!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Update error time entry');
    },
  });
};

export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTimeEntry(id),
    onSuccess: () => {
      // Invalidate all related queries to update the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.dashboard() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.timeChart() });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics.projects() });
      queryClient.invalidateQueries({ queryKey: ['timeEntries', 'stats'] });
      toast.success('Time entry deleted!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Deletion error time entry');
    },
  });
};

export const useTimeStats = (taskId: string) => {
  return useQuery({
    queryKey: queryKeys.timeEntries.stats(taskId),
    queryFn: () => apiClient.getTimeStats(taskId),
    enabled: !!taskId,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
  });
};

// Analytics Hooks
export const useDashboard = (period = 30) => {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard(period),
    queryFn: () => analyticsService.getDashboardMetrics(period),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
  });
};

export const useTimeChart = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.analytics.timeChart(params),
    queryFn: () => apiClient.getTimeChartData(params),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
  });
};

export const useExportReport = () => {
  return useMutation({
    mutationFn: ({ format, params }: { format: 'csv' | 'pdf'; params?: any }) =>
      apiClient.exportReport(format, params),
    onSuccess: (blob, variables) => {
      // Create unique filename with current date and time
      const now = new Date();
      const dateTimeString = now.toISOString()
        .replace(/T/, '-')
        .replace(/:/g, '-')
        .split('.')[0]; // Remove milliseconds
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytic-report-${dateTimeString}.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report downloaded!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Report export error');
    },
  });
};

// Notifications Hooks
export const useNotifications = () => {
  const { setNotifications } = useNotificationsStore();

  const query = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => apiClient.getNotifications(),
    refetchInterval: 30 * 1000, // Check every 30 seconds
  });

  useEffect(() => {
    if (query.data?.success && query.data.data) {
      setNotifications(query.data.data);
    }
  }, [query.data, setNotifications]);

  return {
    ...query,
    notifications: query.data?.data || [],
  };
};

// Reminders Hooks
export const useReminderSettings = () => {
  const { setReminderSettings } = useAppSettingsStore();

  const query = useQuery({
    queryKey: queryKeys.reminders.settings,
    queryFn: () => apiClient.getReminderSettings(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (query.data?.success && query.data.data) {
      setReminderSettings(query.data.data);
    }
  }, [query.data, setReminderSettings]);

  return {
    ...query,
    settings: query.data?.data,
  };
};

// Generic Loading Hook
export const useLoading = (key: string) => {
  const { isLoading, setLoading } = useLoadingStore();
  
  return {
    isLoading: isLoading[key] || false,
    setLoading: (loading: boolean) => setLoading(key, loading),
  };
};

// PWA Hook
export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('App installed!');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return {
    isInstallable,
    installApp,
  };
};

// Theme Hook
export const useTheme = () => {
  const { theme, setTheme } = useAppSettingsStore();
  
  const systemTheme = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }, []);

  const currentTheme = theme === 'system' ? systemTheme : theme;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (theme === 'system') {
          // Force re-render when system theme changes
          window.dispatchEvent(new CustomEvent('themechange'));
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return {
    theme,
    currentTheme,
    setTheme,
    isDark: currentTheme === 'dark',
  };
};

// User Settings Hook
export const useUserSettings = () => {
  const queryClient = useQueryClient();

  // Load settings from localStorage (only general settings)
  const loadLocalSettings = () => {
    try {
      const saved = localStorage.getItem('userSettings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  // Save settings to localStorage
  const saveLocalSettings = (settings: any) => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  };

  const query = useQuery({
    queryKey: ['userSettings'],
    queryFn: loadLocalSettings,
    staleTime: Infinity, // Never refetch
  });

  const updateMutation = useMutation({
    mutationFn: async (settings: any) => {
      // TODO: Add real API call
      // await apiClient.updateUserSettings(settings);
      
      // For now, just save to localStorage
      saveLocalSettings(settings);
      return settings;
    },
    onSuccess: (newSettings) => {
      queryClient.setQueryData(['userSettings'], newSettings);
      toast.success('Settings saved successfully!');
    },
    onError: (error: any) => {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}; 