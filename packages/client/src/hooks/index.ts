import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import apiClient from '../api/client';
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
  DeviceInfo
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
        toast.success('Успішний вхід!');
        queryClient.invalidateQueries();
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка входу');
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
        toast.success('Успішна реєстрація!');
        queryClient.invalidateQueries();
      } else {
        console.log('⚠️ useAuth: Registration response missing success or data');
      }
    },
    onError: (error: any) => {
      console.error('❌ useAuth: Registration API call failed', error);
      toast.error(error.response?.data?.message || 'Помилка реєстрації');
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Ви вийшли з системи');
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

// Tasks Hooks
export const useTasks = (filters?: TaskFilters, page = 1, limit = 20) => {
  const { setTasks, setPagination } = useTasksStore();

  const query = useQuery({
    queryKey: queryKeys.tasks.list(filters, page),
    queryFn: () => apiClient.getTasks({ page, limit, filters }),
    staleTime: 30 * 1000, // 30 seconds
  });

  useEffect(() => {
    if (query.data?.success && query.data.data?.data) {
      setTasks(query.data.data.data);
      // The pagination info is in query.data.data, not query.data.pagination
      const paginationInfo = {
        page: query.data.data.page,
        limit: query.data.data.limit,
        total: query.data.data.total,
        totalPages: query.data.data.totalPages,
        hasNext: query.data.data.page < query.data.data.totalPages,
        hasPrev: query.data.data.page > 1,
      };
      setPagination(paginationInfo);
    }
  }, [query.data, setTasks, setPagination]);

  return {
    ...query,
    tasks: query.data?.data?.data || [],
    pagination: query.data?.data ? {
      page: query.data.data.page,
      limit: query.data.data.limit,
      total: query.data.data.total,
      totalPages: query.data.data.totalPages,
      hasNext: query.data.data.page < query.data.data.totalPages,
      hasPrev: query.data.data.page > 1,
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
    mutationFn: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) =>
      apiClient.createTask(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        addTask(response.data);
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
        toast.success('Завдання створено!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка створення завдання');
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  const { updateTask } = useTasksStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      apiClient.updateTask(id, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        updateTask(variables.id, response.data);
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
        toast.success('Завдання оновлено!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка оновлення завдання');
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  const { deleteTask } = useTasksStore();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTask(id),
    onSuccess: (_, id) => {
      deleteTask(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      toast.success('Завдання видалено!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка видалення завдання');
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
    queryFn: () => apiClient.getProjects(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  useEffect(() => {
    if (query.data?.success && query.data.data) {
      setProjects(query.data.data);
    }
  }, [query.data, setProjects]);

  return {
    ...query,
    projects: query.data?.data || [],
  };
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { addProject } = useProjectsStore();

  return useMutation({
    mutationFn: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) =>
      apiClient.createProject(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        addProject(response.data);
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
        toast.success('Проект створено!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка створення проекту');
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { updateProject } = useProjectsStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      apiClient.updateProject(id, data),
    onSuccess: (response, variables) => {
      if (response.success && response.data) {
        updateProject(variables.id, response.data);
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
        toast.success('Проект оновлено!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка оновлення проекту');
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const { deleteProject } = useProjectsStore();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteProject(id),
    onSuccess: (_, id) => {
      deleteProject(id);
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      toast.success('Проект видалено!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка видалення проекту');
    },
  });
};

// Time Tracking Hooks
export const useActiveTimer = () => {
  const { setActiveTimer } = useTimeTrackingStore();

  const query = useQuery({
    queryKey: queryKeys.timeEntries.active,
    queryFn: () => apiClient.getActiveTimer(),
    refetchInterval: 1000, // Update every second
    staleTime: 0,
  });

  useEffect(() => {
    if (query.data?.success) {
      setActiveTimer(query.data.data || null);
    }
  }, [query.data, setActiveTimer]);

  return {
    ...query,
    activeTimer: query.data?.data,
  };
};

export const useStartTimer = () => {
  const queryClient = useQueryClient();
  const { setActiveTimer } = useTimeTrackingStore();

  return useMutation({
    mutationFn: ({ taskId, description }: { taskId: string; description?: string }) =>
      apiClient.startTimer(taskId, description),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setActiveTimer(response.data);
        queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.active });
        toast.success('Таймер запущено!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка запуску таймера');
    },
  });
};

export const useStopTimer = () => {
  const queryClient = useQueryClient();
  const { setActiveTimer } = useTimeTrackingStore();

  return useMutation({
    mutationFn: (id: string) => apiClient.stopTimer(id),
    onSuccess: (response) => {
      if (response.success) {
        setActiveTimer(null);
        queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.active });
        toast.success('Таймер зупинено!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка зупинки таймера');
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
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useCreateTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) =>
      apiClient.createTimeEntry(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.stats(response.data.taskId) });
        toast.success('Запис часу створено!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка створення запису часу');
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
        queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all });
        queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.stats(response.data.taskId) });
        toast.success('Запис часу оновлено!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка оновлення запису часу');
    },
  });
};

export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteTimeEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries.all });
      toast.success('Запис часу видалено!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка видалення запису часу');
    },
  });
};

export const useTimeStats = (taskId: string) => {
  return useQuery({
    queryKey: queryKeys.timeEntries.stats(taskId),
    queryFn: () => apiClient.getTimeStats(taskId),
    enabled: !!taskId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

// Analytics Hooks
export const useDashboard = (period = 30) => {
  return useQuery({
    queryKey: queryKeys.analytics.dashboard(period),
    queryFn: () => apiClient.getDashboardMetrics(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTimeChart = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.analytics.timeChart(params),
    queryFn: () => apiClient.getTimeChartData(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useExportReport = () => {
  return useMutation({
    mutationFn: ({ format, params }: { format: 'csv' | 'pdf'; params?: any }) =>
      apiClient.exportReport(format, params),
    onSuccess: (blob, variables) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Звіт завантажено!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Помилка експорту звіту');
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
      toast.success('Додаток встановлено!');
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