import { apiClient } from './client';
import type { Notification } from './types';

/**
 * API методы для работы с уведомлениями
 */
export const notificationsApi = {
  /**
   * Получить список уведомлений текущего пользователя
   */
  async getNotifications(params?: {
    unread_only?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>('/notifications', { params });
    return response.data;
  },

  /**
   * Отметить уведомление как прочитанное
   */
  async markAsRead(notificationId: number): Promise<Notification> {
    const response = await apiClient.post<Notification>(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Отметить все уведомления как прочитанные
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/read-all');
  },
};
