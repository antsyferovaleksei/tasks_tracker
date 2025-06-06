import { z } from 'zod';
import { TaskStatus, TaskPriority, NotificationType } from './types';

// User validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Некоректний email'),
  name: z.string().min(2, 'Ім\'я повинно містити принаймні 2 символи'),
  password: z.string().min(6, 'Пароль повинен містити принаймні 6 символів'),
});

export const loginSchema = z.object({
  email: z.string().email('Некоректний email'),
  password: z.string().min(1, 'Пароль обов\'язковий'),
});

// Project validation schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Назва проекту обов\'язкова'),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Некоректний колір').optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  archived: z.boolean().optional(),
});

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Назва завдання обов\'язкова'),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  projectId: z.string().optional(),
  tagIds: z.array(z.string()).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().datetime().optional().or(z.date().optional()),
  projectId: z.string().optional(),
  archived: z.boolean().optional(),
  tagIds: z.array(z.string()).optional(),
});

// Tag validation schemas
export const createTagSchema = z.object({
  name: z.string().min(1, 'Назва тегу обов\'язкова'),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Некоректний колір').optional(),
});

export const updateTagSchema = z.object({
  name: z.string().min(1).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

// Time Entry validation schemas
export const createTimeEntrySchema = z.object({
  taskId: z.string().min(1, 'ID завдання обов\'язковий'),
  description: z.string().optional(),
  startTime: z.string().datetime().optional().or(z.date().optional()),
});

export const updateTimeEntrySchema = z.object({
  description: z.string().optional(),
  startTime: z.string().datetime().optional().or(z.date().optional()),
  endTime: z.string().datetime().optional().or(z.date().optional()),
  duration: z.number().min(0).optional(),
});

// Notification validation schemas
export const createNotificationSchema = z.object({
  title: z.string().min(1, 'Заголовок обов\'язковий'),
  message: z.string().min(1, 'Повідомлення обов\'язкове'),
  type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']).optional(),
  userId: z.string().min(1, 'ID користувача обов\'язковий'),
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