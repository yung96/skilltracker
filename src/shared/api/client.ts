import axios, { AxiosError, AxiosInstance } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '../config/constants';

/**
 * Базовый клиент axios с настройками
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // для работы с cookies
});

/**
 * Interceptor для добавления токена в заголовки
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor для обработки ошибок
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - очищаем токен и перенаправляем на логин
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Утилита для обработки ошибок API
 */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { detail?: string };
    return data?.detail || 'Произошла ошибка';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Неизвестная ошибка';
}
