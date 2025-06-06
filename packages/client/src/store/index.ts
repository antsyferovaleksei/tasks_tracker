import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { 
  User, 
  Task, 
  Project, 
  Tag, 
  TimeEntry, 
  TaskFilters, 
  UserFilter,
  Notification,
  ReminderSettings,
  ThemeMode,
  DeviceInfo
} from '../types';

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User, tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      immer((set) => ({
        user: null,
        isAuthenticated: false,
        loading: false,
        login: (user, tokens) =>
          set((state) => {
            state.user = user;
            state.isAuthenticated = true;
            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);
          }),
        logout: () =>
          set((state) => {
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }),
        updateUser: (userData) =>
          set((state) => {
            if (state.user) {
              Object.assign(state.user, userData);
            }
          }),
        setLoading: (loading) =>
          set((state) => {
            state.loading = loading;
          }),
      })),
      {
        name: 'auth-storage',
        partialize: (state) => ({ 
          user: state.user, 
          isAuthenticated: state.isAuthenticated 
        }),
      }
    ),
    { name: 'auth-store' }
  )
);

// Tasks Store
interface TasksState {
  tasks: Task[];
  currentTask: Task | null;
  filters: TaskFilters;
  userFilters: UserFilter[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  setCurrentTask: (task: Task | null) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  setUserFilters: (filters: UserFilter[]) => void;
  addUserFilter: (filter: UserFilter) => void;
  updateUserFilter: (id: string, updates: Partial<UserFilter>) => void;
  deleteUserFilter: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setPagination: (pagination: Partial<TasksState['pagination']>) => void;
}

export const useTasksStore = create<TasksState>()(
  devtools(
    immer((set) => ({
      tasks: [],
      currentTask: null,
      filters: {},
      userFilters: [],
      loading: false,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
      setTasks: (tasks) =>
        set((state) => {
          state.tasks = tasks;
        }),
      addTask: (task) =>
        set((state) => {
          state.tasks.unshift(task);
        }),
      updateTask: (id, updates) =>
        set((state) => {
          const index = state.tasks.findIndex((task) => task.id === id);
          if (index !== -1) {
            Object.assign(state.tasks[index], updates);
          }
          if (state.currentTask?.id === id) {
            Object.assign(state.currentTask, updates);
          }
        }),
      deleteTask: (id) =>
        set((state) => {
          state.tasks = state.tasks.filter((task) => task.id !== id);
          if (state.currentTask?.id === id) {
            state.currentTask = null;
          }
        }),
      setCurrentTask: (task) =>
        set((state) => {
          state.currentTask = task;
        }),
      setFilters: (filters) =>
        set((state) => {
          Object.assign(state.filters, filters);
        }),
      clearFilters: () =>
        set((state) => {
          state.filters = {};
        }),
      setUserFilters: (filters) =>
        set((state) => {
          state.userFilters = filters;
        }),
      addUserFilter: (filter) =>
        set((state) => {
          state.userFilters.push(filter);
        }),
      updateUserFilter: (id, updates) =>
        set((state) => {
          const index = state.userFilters.findIndex((filter) => filter.id === id);
          if (index !== -1) {
            Object.assign(state.userFilters[index], updates);
          }
        }),
      deleteUserFilter: (id) =>
        set((state) => {
          state.userFilters = state.userFilters.filter((filter) => filter.id !== id);
        }),
      setLoading: (loading) =>
        set((state) => {
          state.loading = loading;
        }),
      setPagination: (pagination) =>
        set((state) => {
          Object.assign(state.pagination, pagination);
        }),
    })),
    { name: 'tasks-store' }
  )
);

// Projects Store
interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useProjectsStore = create<ProjectsState>()(
  devtools(
    immer((set) => ({
      projects: [],
      currentProject: null,
      loading: false,
      setProjects: (projects) =>
        set((state) => {
          state.projects = projects;
        }),
      addProject: (project) =>
        set((state) => {
          state.projects.push(project);
        }),
      updateProject: (id, updates) =>
        set((state) => {
          const index = state.projects.findIndex((project) => project.id === id);
          if (index !== -1) {
            Object.assign(state.projects[index], updates);
          }
          if (state.currentProject?.id === id) {
            Object.assign(state.currentProject, updates);
          }
        }),
      deleteProject: (id) =>
        set((state) => {
          state.projects = state.projects.filter((project) => project.id !== id);
          if (state.currentProject?.id === id) {
            state.currentProject = null;
          }
        }),
      setCurrentProject: (project) =>
        set((state) => {
          state.currentProject = project;
        }),
      setLoading: (loading) =>
        set((state) => {
          state.loading = loading;
        }),
    })),
    { name: 'projects-store' }
  )
);

// Tags Store
interface TagsState {
  tags: Tag[];
  loading: boolean;
  setTags: (tags: Tag[]) => void;
  addTag: (tag: Tag) => void;
  updateTag: (id: string, updates: Partial<Tag>) => void;
  deleteTag: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useTagsStore = create<TagsState>()(
  devtools(
    immer((set) => ({
      tags: [],
      loading: false,
      setTags: (tags) =>
        set((state) => {
          state.tags = tags;
        }),
      addTag: (tag) =>
        set((state) => {
          state.tags.push(tag);
        }),
      updateTag: (id, updates) =>
        set((state) => {
          const index = state.tags.findIndex((tag) => tag.id === id);
          if (index !== -1) {
            Object.assign(state.tags[index], updates);
          }
        }),
      deleteTag: (id) =>
        set((state) => {
          state.tags = state.tags.filter((tag) => tag.id !== id);
        }),
      setLoading: (loading) =>
        set((state) => {
          state.loading = loading;
        }),
    })),
    { name: 'tags-store' }
  )
);

// Time Tracking Store
interface TimeTrackingState {
  timeEntries: TimeEntry[];
  activeTimer: TimeEntry | null;
  loading: boolean;
  setTimeEntries: (entries: TimeEntry[]) => void;
  addTimeEntry: (entry: TimeEntry) => void;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;
  setActiveTimer: (timer: TimeEntry | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useTimeTrackingStore = create<TimeTrackingState>()(
  devtools(
    immer((set) => ({
      timeEntries: [],
      activeTimer: null,
      loading: false,
      setTimeEntries: (entries) =>
        set((state) => {
          state.timeEntries = entries;
        }),
      addTimeEntry: (entry) =>
        set((state) => {
          state.timeEntries.unshift(entry);
        }),
      updateTimeEntry: (id, updates) =>
        set((state) => {
          const index = state.timeEntries.findIndex((entry) => entry.id === id);
          if (index !== -1) {
            Object.assign(state.timeEntries[index], updates);
          }
          if (state.activeTimer?.id === id) {
            Object.assign(state.activeTimer, updates);
          }
        }),
      deleteTimeEntry: (id) =>
        set((state) => {
          state.timeEntries = state.timeEntries.filter((entry) => entry.id !== id);
          if (state.activeTimer?.id === id) {
            state.activeTimer = null;
          }
        }),
      setActiveTimer: (timer) =>
        set((state) => {
          state.activeTimer = timer;
        }),
      setLoading: (loading) =>
        set((state) => {
          state.loading = loading;
        }),
    })),
    { name: 'time-tracking-store' }
  )
);

// Notifications Store
interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  devtools(
    immer((set) => ({
      notifications: [],
      unreadCount: 0,
      loading: false,
      setNotifications: (notifications) =>
        set((state) => {
          state.notifications = notifications;
          state.unreadCount = notifications.filter((n) => !n.read).length;
        }),
      addNotification: (notification) =>
        set((state) => {
          state.notifications.unshift(notification);
          if (!notification.read) {
            state.unreadCount += 1;
          }
        }),
      markAsRead: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (notification && !notification.read) {
            notification.read = true;
            state.unreadCount -= 1;
          }
        }),
      markAllAsRead: () =>
        set((state) => {
          state.notifications.forEach((n) => {
            n.read = true;
          });
          state.unreadCount = 0;
        }),
      deleteNotification: (id) =>
        set((state) => {
          const notification = state.notifications.find((n) => n.id === id);
          if (notification && !notification.read) {
            state.unreadCount -= 1;
          }
          state.notifications = state.notifications.filter((n) => n.id !== id);
        }),
      setLoading: (loading) =>
        set((state) => {
          state.loading = loading;
        }),
    })),
    { name: 'notifications-store' }
  )
);

// App Settings Store
interface AppSettingsState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  deviceInfo: DeviceInfo;
  reminderSettings: ReminderSettings | null;
  setTheme: (theme: ThemeMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setDeviceInfo: (info: DeviceInfo) => void;
  setReminderSettings: (settings: ReminderSettings) => void;
}

export const useAppSettingsStore = create<AppSettingsState>()(
  devtools(
    persist(
      immer((set) => ({
        theme: 'system',
        sidebarOpen: true,
        deviceInfo: {
          isMobile: false,
          isTablet: false,
          isDesktop: true,
        },
        reminderSettings: null,
        setTheme: (theme) =>
          set((state) => {
            state.theme = theme;
          }),
        toggleSidebar: () =>
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          }),
        setSidebarOpen: (open) =>
          set((state) => {
            state.sidebarOpen = open;
          }),
        setDeviceInfo: (info) =>
          set((state) => {
            state.deviceInfo = info;
            // Auto-close sidebar on mobile
            if (info.isMobile) {
              state.sidebarOpen = false;
            }
          }),
        setReminderSettings: (settings) =>
          set((state) => {
            state.reminderSettings = settings;
          }),
      })),
      {
        name: 'app-settings',
        partialize: (state) => ({ 
          theme: state.theme, 
          sidebarOpen: state.sidebarOpen 
        }),
      }
    ),
    { name: 'app-settings-store' }
  )
);

// Global Loading Store
interface LoadingState {
  isLoading: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;
  isAnyLoading: () => boolean;
}

export const useLoadingStore = create<LoadingState>()(
  devtools(
    immer((set, get) => ({
      isLoading: {},
      setLoading: (key, loading) =>
        set((state) => {
          if (loading) {
            state.isLoading[key] = true;
          } else {
            delete state.isLoading[key];
          }
        }),
      isAnyLoading: () => Object.keys(get().isLoading).length > 0,
    })),
    { name: 'loading-store' }
  )
); 