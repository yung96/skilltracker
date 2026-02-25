import { apiClient } from './client';
import type {
  Task,
  TaskCreate,
  TaskUpdate,
  ProgressUpdate,
  Comment,
  CommentCreate,
  CommentUpdate,
  Attachment,
} from './types';

/**
 * API методы для работы с задачами
 */
export const tasksApi = {
  /**
   * Получить список задач с поддержкой поиска, фильтров и пагинации
   */
  async getTasks(params?: {
    status?: string;
    employee_id?: number;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<Task[]> {
    const response = await apiClient.get<Task[]>('/tasks', { params });
    return response.data;
  },

  /**
   * Получить задачу по ID
   */
  async getTask(id: number): Promise<Task> {
    const response = await apiClient.get<Task>(`/tasks/${id}`);
    return response.data;
  },

  /**
   * Создать задачу (только для менеджеров)
   */
  async createTask(data: TaskCreate): Promise<Task> {
    const response = await apiClient.post<Task>('/tasks', data);
    return response.data;
  },

  /**
   * Обновить задачу (только для менеджеров)
   */
  async updateTask(id: number, data: TaskUpdate): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/${id}`, data);
    return response.data;
  },

  /**
   * Обновить прогресс задачи
   */
  async updateProgress(id: number, data: ProgressUpdate): Promise<Task> {
    const response = await apiClient.patch<Task>(`/tasks/${id}/progress`, data);
    return response.data;
  },

  /**
   * Удалить задачу (только для менеджеров)
   */
  async deleteTask(id: number): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },

  /**
   * Получить комментарии к задаче
   */
  async getComments(taskId: number): Promise<Comment[]> {
    const response = await apiClient.get<Comment[]>(`/tasks/${taskId}/comments`);
    return response.data;
  },

  /**
   * Добавить комментарий
   */
  async addComment(taskId: number, data: CommentCreate): Promise<Comment> {
    const response = await apiClient.post<Comment>(`/tasks/${taskId}/comments`, data);
    return response.data;
  },

  /**
   * Обновить комментарий
   */
  async updateComment(taskId: number, commentId: number, data: CommentUpdate): Promise<Comment> {
    const response = await apiClient.put<Comment>(`/tasks/${taskId}/comments/${commentId}`, data);
    return response.data;
  },

  /**
   * Удалить комментарий
   */
  async deleteComment(taskId: number, commentId: number): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}/comments/${commentId}`);
  },

  /**
   * Получить вложения задачи
   */
  async getAttachments(taskId: number): Promise<Attachment[]> {
    const response = await apiClient.get<Attachment[]>(`/tasks/${taskId}/attachments`);
    return response.data;
  },

  /**
   * Загрузить вложение
   */
  async uploadAttachment(taskId: number, file: File): Promise<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<Attachment>(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Удалить вложение
   */
  async deleteAttachment(taskId: number, attachmentId: number): Promise<void> {
    await apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
  },
};
