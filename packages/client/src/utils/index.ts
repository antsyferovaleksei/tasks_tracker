import { format, formatDistanceToNow, parseISO, isValid, differenceInMinutes } from 'date-fns';
import { uk } from 'date-fns/locale';
import { TaskStatus, TaskPriority } from '../types';

// Date formatting utilities
export const formatDate = (date: string | Date, formatStr = 'dd.MM.yyyy'): string => {
  try {
    if (!date) return 'Не встановлено';
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Невірна дата';
    return format(dateObj, formatStr, { locale: uk });
  } catch {
    return 'Невірна дата';
  }
};

export const formatDateTime = (date: string | Date): string => {
  return formatDate(date, 'dd.MM.yyyy HH:mm');
};

export const formatRelativeTime = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return 'Невірна дата';
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: uk });
  } catch {
    return 'Невірна дата';
  }
};

export const formatTime = (date: string | Date): string => {
  return formatDate(date, 'HH:mm');
};

// Duration formatting utilities
export const formatDuration = (seconds: number, t?: (key: string) => string): string => {
  if (seconds < 60) {
    return t ? `${seconds} ${t('time.seconds')}` : `${seconds}с`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    if (t) {
      return remainingSeconds > 0 
        ? `${minutes} ${t('time.minutes')} ${remainingSeconds} ${t('time.seconds')}`
        : `${minutes} ${t('time.minutes')}`;
    }
    return remainingSeconds > 0 ? `${minutes}хв ${remainingSeconds}с` : `${minutes}хв`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (t) {
    let result = `${hours} ${t('time.hours')}`;
    if (remainingMinutes > 0) {
      result += ` ${remainingMinutes} ${t('time.minutes')}`;
    }
    if (remainingSeconds > 0 && hours === 0) {
      result += ` ${remainingSeconds} ${t('time.seconds')}`;
    }
    return result;
  }
  
  let result = `${hours}г`;
  if (remainingMinutes > 0) {
    result += ` ${remainingMinutes}хв`;
  }
  if (remainingSeconds > 0 && hours === 0) {
    result += ` ${remainingSeconds}с`;
  }
  
  return result;
};

export const formatDurationShort = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
};

export const parseDurationToSeconds = (duration: string): number => {
  // Parse formats like "1h 30m", "90m", "1:30", etc.
  const hourMatch = duration.match(/(\d+)h/);
  const minuteMatch = duration.match(/(\d+)m/);
  const colonMatch = duration.match(/^(\d+):(\d+)$/);
  
  let totalSeconds = 0;
  
  if (colonMatch) {
    // Format: "1:30"
    totalSeconds = parseInt(colonMatch[1]) * 3600 + parseInt(colonMatch[2]) * 60;
  } else {
    // Format: "1h 30m" or "90m"
    if (hourMatch) {
      totalSeconds += parseInt(hourMatch[1]) * 3600;
    }
    if (minuteMatch) {
      totalSeconds += parseInt(minuteMatch[1]) * 60;
    }
  }
  
  return totalSeconds;
};

// Task utilities
export const getTaskStatusLabel = (status: TaskStatus): string => {
  const labels: Record<TaskStatus, string> = {
    TODO: 'До виконання',
    IN_PROGRESS: 'В роботі',
    COMPLETED: 'Completed',
    CANCELLED: 'Скасовано',
  };
  return labels[status] || status;
};

export const getTaskPriorityLabel = (priority: TaskPriority): string => {
  const labels: Record<TaskPriority, string> = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent',
  };
  return labels[priority] || priority;
};

export const getTaskStatusColor = (status: TaskStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const colors: Record<TaskStatus, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    TODO: 'default',
    IN_PROGRESS: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'error',
  };
  return colors[status] || 'default';
};

export const getTaskPriorityColor = (priority: TaskPriority): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  const colors: Record<TaskPriority, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'> = {
    LOW: 'success',
    MEDIUM: 'warning', 
    HIGH: 'error',
    URGENT: 'secondary',
  };
  return colors[priority] || 'default';
};

export const isTaskOverdue = (dueDate?: string): boolean => {
  if (!dueDate) return false;
  const due = parseISO(dueDate);
  return isValid(due) && due < new Date();
};

export const getTaskDeadlineStatus = (dueDate?: string): 'overdue' | 'today' | 'soon' | 'normal' => {
  if (!dueDate) return 'normal';
  
  const due = parseISO(dueDate);
  if (!isValid(due)) return 'normal';
  
  const now = new Date();
  const minutesUntilDue = differenceInMinutes(due, now);
  
  if (minutesUntilDue < 0) return 'overdue';
  if (minutesUntilDue < 24 * 60) return 'today';
  if (minutesUntilDue < 3 * 24 * 60) return 'soon';
  
  return 'normal';
};

// Color utilities
export const hexToRgba = (hex: string, alpha = 1): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const generateRandomColor = (): string => {
  const colors = [
    '#f44336', '#e91e63', '#9c27b0', '#673ab7',
    '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
    '#009688', '#4caf50', '#8bc34a', '#cddc39',
    '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password повинен містити принаймні 8 символів');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password повинен містити принаймні одну велику літеру');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password повинен містити принаймні одну малу літеру');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password повинен містити принаймні одну цифру');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// Text utilities
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const highlightText = (text: string, query: string): string => {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

export const stripHtml = (html: string): string => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
};

// Number utilities
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('uk-UA').format(num);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Б';
  
  const k = 1024;
  const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// URL utilities
export const createQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.set(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};

export const parseQueryString = (queryString: string): Record<string, any> => {
  const params = new URLSearchParams(queryString);
  const result: Record<string, any> = {};
  
  for (const [key, value] of params) {
    if (result[key]) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
  }
  
  return result;
};

// Local storage utilities
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch {
      return defaultValue || null;
    }
  },
  
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch {
    return false;
  }
};

// Download file
export const downloadFile = (data: Blob | string, filename: string, type?: string): void => {
  const blob = data instanceof Blob ? data : new Blob([data], { type: type || 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Environment utilities
export const isDevelopment = (): boolean => {
  return (import.meta as any).env?.DEV || false;
};

export const isProduction = (): boolean => {
  return (import.meta as any).env?.PROD || false;
};

export const getEnvironment = (): 'development' | 'production' | 'test' => {
  if (isDevelopment()) return 'development';
  if (isProduction()) return 'production';
  return 'test';
}; 