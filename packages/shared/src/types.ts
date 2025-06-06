// Database enums
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  archived: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    tasks: number;
  };
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  color?: string;
  archived?: boolean;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  completedAt?: Date;
  archived: boolean;
  userId: string;
  projectId?: string;
  createdAt: Date;
  updatedAt: Date;
  project?: Project;
  tags?: Tag[];
  timeEntries?: TimeEntry[];
  _count?: {
    timeEntries: number;
  };
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  projectId?: string;
  tagIds?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  projectId?: string;
  archived?: boolean;
  tagIds?: string[];
}

// Tag types
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTagDto {
  name: string;
  color?: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string;
}

// Time Entry types
export interface TimeEntry {
  id: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  isRunning: boolean;
  userId: string;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
  task?: Task;
}

export interface CreateTimeEntryDto {
  taskId: string;
  description?: string;
  startTime?: Date;
}

export interface UpdateTimeEntryDto {
  description?: string;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
}

// Notification types
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type?: NotificationType;
  userId: string;
}

// Filter and search types
export interface TaskFilters {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  projectId?: string;
  tagIds?: string[];
  dueDate?: {
    from?: Date;
    to?: Date;
  };
  search?: string;
  archived?: boolean;
}

export interface TimeEntryFilters {
  taskId?: string;
  projectId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Analytics types
export interface TaskAnalytics {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByPriority: Record<TaskPriority, number>;
  tasksByProject: Array<{
    projectId: string;
    projectName: string;
    count: number;
  }>;
}

export interface TimeAnalytics {
  totalTimeSpent: number;
  timeByProject: Array<{
    projectId: string;
    projectName: string;
    time: number;
  }>;
  timeByTask: Array<{
    taskId: string;
    taskTitle: string;
    time: number;
  }>;
  dailyTime: Array<{
    date: string;
    time: number;
  }>;
} 