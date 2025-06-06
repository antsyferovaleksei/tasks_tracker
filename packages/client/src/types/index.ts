// Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  _count?: {
    tasks: number;
  };
}

// Task types
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  projectId?: string;
  project?: Project;
  tags?: TaskTag[];
  timeEntries?: TimeEntry[];
  _count?: {
    timeEntries: number;
  };
}

// Tag types
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskTag {
  taskId: string;
  tagId: string;
  task: Task;
  tag: Tag;
}

// Time tracking types
export interface TimeEntry {
  id: string;
  description?: string;
  startTime: string;
  endTime?: string;
  duration?: number; // in seconds
  isRunning: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  taskId: string;
  task?: Task;
}

export interface TimeStats {
  totalTime: number;
  totalEntries: number;
  averageTime: number;
  taskId: string;
  task?: Task;
}

// Filter types
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  tagIds?: string[];
  search?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  createdFrom?: string;
  createdTo?: string;
}

export interface UserFilter {
  id: string;
  name: string;
  filters: TaskFilters;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface QuickFilter {
  id: string;
  name: string;
  filters: TaskFilters;
  count: number;
}

// Notification types
export type NotificationType = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// Reminder types
export type ReminderType = 'EMAIL' | 'PUSH';
export type ReminderFrequency = 'DAILY' | 'WEEKLY' | 'CUSTOM';

export interface ReminderSettings {
  id: string;
  emailReminders: boolean;
  pushNotifications: boolean;
  reminderFrequency: ReminderFrequency;
  daysBeforeDeadline: number;
  customReminderTimes: string[];
  quietHoursStart?: string;
  quietHoursEnd?: string;
  weekendReminders: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface ScheduledReminder {
  id: string;
  type: ReminderType;
  scheduledFor: string;
  sent: boolean;
  title: string;
  message: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  userId: string;
  taskId?: string;
  task?: Task;
}

// Analytics types
export interface DashboardMetrics {
  summary: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
    totalTimeSpent: number;
    projectsCount: number;
    completionRate: string;
  };
  charts: {
    dailyStats: Array<{
      date: string;
      created: number;
      completed: number;
    }>;
    priorityStats: Array<{
      priority: TaskPriority;
      count: number;
    }>;
    statusStats: Array<{
      status: TaskStatus;
      count: number;
    }>;
    projectTimeStats: Array<{
      project_name: string;
      total_time: number;
      tasks_count: number;
    }>;
    weekdayStats: Array<{
      weekday: string;
      avg_time: number;
      entries_count: number;
    }>;
  };
}

export interface TimeChartData {
  timeData: Array<{
    period: string;
    total_time: number;
    tasks_count: number;
  }>;
  summary: {
    totalTime: number;
    totalTasks: number;
    period: string;
    groupBy: string;
  };
}

export interface ProjectReport {
  projects: Array<{
    id: string;
    name: string;
    description?: string;
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    overdue_tasks: number;
    total_time_spent: number;
    time_entries_count: number;
    created_at: string;
    updated_at: string;
  }>;
  summary: {
    totalProjects: number;
    totalTime: number;
    totalTasks: number;
    completedTasks: number;
    period: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
}

// UI State types
export interface LoadingState {
  [key: string]: boolean;
}

export interface ErrorState {
  [key: string]: string | null;
}

// Export formats
export type ExportFormat = 'csv' | 'pdf';

// Chart types for analytics
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

// PWA types
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';

// Mobile detection
export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
} 