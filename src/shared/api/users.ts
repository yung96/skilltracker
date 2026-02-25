import { apiClient } from './client';
import type { User, UserCreate, UserUpdate, UserQuizHistoryItem } from './types';

/**
 * API методы для работы с пользователями
 */
export const usersApi = {
  /**
   * Получить список пользователей с поддержкой поиска, фильтров и пагинации (только для менеджеров)
   */
  async getUsers(params?: {
    role?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users', { params });
    return response.data;
  },

  /**
   * Получить пользователя по ID
   */
  async getUser(id: number): Promise<User> {
    const response = await apiClient.get<User>(`/users/${id}`);
    return response.data;
  },

  /**
   * Создать пользователя (только для менеджеров)
   */
  async createUser(data: UserCreate): Promise<User> {
    const response = await apiClient.post<User>('/users', data);
    return response.data;
  },

  /**
   * Обновить пользователя
   */
  async updateUser(id: number, data: UserUpdate): Promise<User> {
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Удалить пользователя (только для менеджеров)
   */
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  /**
   * Получить историю прохождения тестов пользователя
   */
  async getUserQuizHistory(
    userId: number,
    params?: {
      quiz_id?: number;
      status_filter?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<UserQuizHistoryItem[]> {
    const response = await apiClient.get<UserQuizHistoryItem[]>(`/users/${userId}/quiz-history`, { params });
    return response.data;
  },
};
