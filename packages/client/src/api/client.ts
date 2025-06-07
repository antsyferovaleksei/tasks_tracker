import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  AuthTokens, 
  LoginRequest, 
  RegisterRequest,
  Project,
  Task,
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
  ProjectReport
} from '../types';

class ApiClient {
  private instance: AxiosInstance;
  private baseURL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';

  constructor() {
    this.instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling and token refresh
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

                      try {
              const refreshToken = localStorage.getItem('refreshToken');
              if (refreshToken) {
                const response = await this.refreshToken(refreshToken);
                if (response.data?.accessToken) {
                  const { accessToken } = response.data;
                  
                  localStorage.setItem('accessToken', accessToken);
                  originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                  
                  return this.instance(originalRequest);
                }
              }
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth API
  async login(data: LoginRequest): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> {
    const response = await this.instance.post('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterRequest): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> {
    const response = await this.instance.post('/auth/register', data);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    const response = await this.instance.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.instance.post('/auth/logout');
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.instance.get('/auth/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.instance.put('/auth/profile', data);
    return response.data;
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<any>> {
    const response = await this.instance.post('/auth/change-password', data);
    return response.data;
  }

  // Projects API
  async getProjects(): Promise<ApiResponse<Project[]>> {
    const response = await this.instance.get('/projects');
    return response.data;
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    const response = await this.instance.get(`/projects/${id}`);
    return response.data;
  }

  async createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<ApiResponse<Project>> {
    const response = await this.instance.post('/projects', data);
    return response.data;
  }

  async updateProject(id: string, data: Partial<Project>): Promise<ApiResponse<Project>> {
    const response = await this.instance.put(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id: string): Promise<ApiResponse> {
    const response = await this.instance.delete(`/projects/${id}`);
    return response.data;
  }

  // Tasks API
  async getTasks(params?: {
    page?: number;
    limit?: number;
    filters?: TaskFilters;
  }): Promise<PaginatedResponse<Task>> {
    // Форматуємо параметри для правильної передачі на backend
    const queryParams: any = {};
    
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;
    
    // Додаємо фільтри як окремі параметри (без префіксу filters)
    if (params?.filters) {
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value) && value.length > 0) {
            queryParams[key] = value;
          } else if (!Array.isArray(value)) {
            queryParams[key] = value;
          }
        }
      });
    }
    
    console.log('API query params:', queryParams);
    
    const response = await this.instance.get('/tasks', { params: queryParams });
    return response.data;
  }

  async getTask(id: string): Promise<ApiResponse<Task>> {
    const response = await this.instance.get(`/tasks/${id}`);
    return response.data;
  }

  async createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<ApiResponse<Task>> {
    const response = await this.instance.post('/tasks', data);
    return response.data;
  }

  async updateTask(id: string, data: Partial<Task>): Promise<ApiResponse<Task>> {
    const response = await this.instance.put(`/tasks/${id}`, data);
    return response.data;
  }

  async deleteTask(id: string): Promise<ApiResponse> {
    const response = await this.instance.delete(`/tasks/${id}`);
    return response.data;
  }

  async searchTasks(query: string): Promise<ApiResponse<Task[]>> {
    const response = await this.instance.get(`/tasks/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  // Tags API
  async getTags(): Promise<ApiResponse<Tag[]>> {
    const response = await this.instance.get('/tags');
    return response.data;
  }

  async createTag(data: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Tag>> {
    const response = await this.instance.post('/tags', data);
    return response.data;
  }

  async updateTag(id: string, data: Partial<Tag>): Promise<ApiResponse<Tag>> {
    const response = await this.instance.put(`/tags/${id}`, data);
    return response.data;
  }

  async deleteTag(id: string): Promise<ApiResponse> {
    const response = await this.instance.delete(`/tags/${id}`);
    return response.data;
  }

  async addTagToTask(taskId: string, tagId: string): Promise<ApiResponse> {
    const response = await this.instance.post(`/tasks/${taskId}/tags/${tagId}`);
    return response.data;
  }

  async removeTagFromTask(taskId: string, tagId: string): Promise<ApiResponse> {
    const response = await this.instance.delete(`/tasks/${taskId}/tags/${tagId}`);
    return response.data;
  }

  // Time Entries API
  async getTimeEntries(params?: {
    taskId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<TimeEntry[]>> {
    const response = await this.instance.get('/time-entries', { params });
    return response.data;
  }

  async createTimeEntry(data: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<ApiResponse<TimeEntry>> {
    const response = await this.instance.post('/time-entries', data);
    return response.data;
  }

  async updateTimeEntry(id: string, data: Partial<TimeEntry>): Promise<ApiResponse<TimeEntry>> {
    const response = await this.instance.put(`/time-entries/${id}`, data);
    return response.data;
  }

  async deleteTimeEntry(id: string): Promise<ApiResponse> {
    const response = await this.instance.delete(`/time-entries/${id}`);
    return response.data;
  }

  async startTimer(taskId: string, description?: string): Promise<ApiResponse<TimeEntry>> {
    const response = await this.instance.post(`/time-entries/tasks/${taskId}/start`, { description });
    return response.data;
  }

  async stopTimer(id: string): Promise<ApiResponse<TimeEntry>> {
    const response = await this.instance.put(`/time-entries/${id}/stop`);
    return response.data;
  }

  async getActiveTimer(): Promise<ApiResponse<TimeEntry | null>> {
    const response = await this.instance.get('/time-entries/active');
    return response.data;
  }

  async getTimeStats(taskId: string): Promise<ApiResponse<TimeStats>> {
    const response = await this.instance.get(`/time-entries/tasks/${taskId}/stats`);
    return response.data;
  }

  // Filters API
  async getQuickFilters(): Promise<ApiResponse<QuickFilter[]>> {
    const response = await this.instance.get('/filters/quick');
    return response.data;
  }

  async getUserFilters(): Promise<ApiResponse<UserFilter[]>> {
    const response = await this.instance.get('/filters/saved');
    return response.data;
  }

  async createUserFilter(data: Omit<UserFilter, 'id' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<ApiResponse<UserFilter>> {
    const response = await this.instance.post('/filters/saved', data);
    return response.data;
  }

  async updateUserFilter(id: string, data: Partial<UserFilter>): Promise<ApiResponse<UserFilter>> {
    const response = await this.instance.put(`/filters/saved/${id}`, data);
    return response.data;
  }

  async deleteUserFilter(id: string): Promise<ApiResponse> {
    const response = await this.instance.delete(`/filters/saved/${id}`);
    return response.data;
  }

  // Notifications API
  async getNotifications(params?: { read?: boolean }): Promise<ApiResponse<Notification[]>> {
    const response = await this.instance.get('/notifications', { params });
    return response.data;
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse<Notification>> {
    const response = await this.instance.put(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    const response = await this.instance.put('/notifications/read-all');
    return response.data;
  }

  async deleteNotification(id: string): Promise<ApiResponse> {
    const response = await this.instance.delete(`/notifications/${id}`);
    return response.data;
  }

  // Reminders API
  async getReminderSettings(): Promise<ApiResponse<ReminderSettings>> {
    const response = await this.instance.get('/reminders/settings');
    return response.data;
  }

  async updateReminderSettings(data: Partial<ReminderSettings>): Promise<ApiResponse<ReminderSettings>> {
    const response = await this.instance.put('/reminders/settings', data);
    return response.data;
  }

  async getScheduledReminders(params?: {
    type?: string;
    sent?: boolean;
    upcoming?: boolean;
  }): Promise<ApiResponse<ScheduledReminder[]>> {
    const response = await this.instance.get('/reminders/scheduled', { params });
    return response.data;
  }

  async createScheduledReminder(data: Omit<ScheduledReminder, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'sent'>): Promise<ApiResponse<ScheduledReminder>> {
    const response = await this.instance.post('/reminders/scheduled', data);
    return response.data;
  }

  async deleteScheduledReminder(id: string): Promise<ApiResponse> {
    const response = await this.instance.delete(`/reminders/scheduled/${id}`);
    return response.data;
  }

  async scheduleDeadlineReminders(): Promise<ApiResponse<{ created: number }>> {
    const response = await this.instance.post('/reminders/schedule-deadlines');
    return response.data;
  }

  // Analytics API
  async getDashboardMetrics(period = 30): Promise<ApiResponse<DashboardMetrics>> {
    const response = await this.instance.get(`/analytics/dashboard?period=${period}`);
    return response.data;
  }

  async getTimeChartData(params?: {
    startDate?: string;
    endDate?: string;
    projectId?: string;
    groupBy?: 'day' | 'week' | 'month' | 'project';
  }): Promise<ApiResponse<TimeChartData>> {
    const response = await this.instance.get('/analytics/time-chart', { params });
    return response.data;
  }

  async getProjectReport(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<ProjectReport>> {
    const response = await this.instance.get('/analytics/projects', { params });
    return response.data;
  }

  async exportReport(format: 'csv' | 'pdf', params?: {
    startDate?: string;
    endDate?: string;
    projectId?: string;
  }): Promise<Blob> {
    const response = await this.instance.get(`/analytics/export/${format}`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  // Utility methods
  async uploadAvatar(file: File): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await this.instance.post('/auth/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await axios.get(`${this.baseURL.replace('/api', '')}/health`);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient; 