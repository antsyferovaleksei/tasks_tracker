import { z } from 'zod';
import { TaskStatus, TaskPriority, NotificationType } from './types';

// User validation schemas для Supabase Auth
export const createUserSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name must contain at least 2 characters'),
  // password тепер валідується в Supabase Auth
});

export const supabaseAuthSignUpSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must contain at least 6 characters'),
  name: z.string().min(2, 'Name must contain at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

// Project validation schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color').optional(),
  archived: z.boolean().optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  archived: z.boolean().optional(),
});

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.union([z.string().datetime(), z.date(), z.null()]).optional(),
  projectId: z.string().min(1, 'Project is required'),
  tagIds: z.array(z.string()).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.union([z.string().datetime(), z.date(), z.null()]).optional(),
  projectId: z.string().optional(),
  archived: z.boolean().optional(),
  tagIds: z.array(z.string()).optional(),
});

// Tag validation schemas
export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color').optional(),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

// Time Entry validation schemas
export const createTimeEntrySchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  description: z.string().optional(),
  startTime: z.union([z.string().datetime(), z.date(), z.null()]).optional(),
  endTime: z.union([z.string().datetime(), z.date(), z.null()]).optional(),
  duration: z.number().optional(), // Allow negative values for time adjustment
});

export const updateTimeEntrySchema = z.object({
  description: z.string().optional(),
  startTime: z.union([z.string().datetime(), z.date(), z.null()]).optional(),
  endTime: z.union([z.string().datetime(), z.date(), z.null()]).optional(),
  duration: z.number().optional(), // Allow negative values for time adjustment
});

// Notification validation schemas
export const createNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']).optional(),
  userId: z.string().min(1, 'User ID is required'),
});

// Query validation schemas
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default('10'),
});

export const taskFiltersSchema = z.object({
  status: z.array(z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])).optional(),
  priority: z.array(z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])).optional(),
  projectId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
  search: z.string().optional(),
  archived: z.string().transform((val: string) => val === 'true').optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
});

export const timeEntryFiltersSchema = z.object({
  taskId: z.string().optional(),
  projectId: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
}); 