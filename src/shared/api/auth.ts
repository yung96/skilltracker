import { apiClient } from './client';
import type { LoginRequest, TokenResponse, User, UserCreate } from './types';

/**
 * API методы для авторизации
 */
export const authApi = {
  /**
   * Вход в систему
   */
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Регистрация (первый пользователь или менеджер создаёт сотрудника)
   */
  async register(data: UserCreate): Promise<User> {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  /**
   * Выход из системы
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  /**
   * Получить текущего пользователя
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};
