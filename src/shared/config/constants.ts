export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://apiskilltracker.tw1.ru/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  TASKS: '/tasks',
  TASK_DETAIL: '/tasks/:id',
  USERS: '/users',
  QUIZZES: '/quizzes',
  QUIZ_DETAIL: '/quizzes/:id',
  QUIZ_ATTEMPT: '/quizzes/:id/attempt/:attemptId',
  MY_ASSIGNMENTS: '/my-assignments',
  PROFILE: '/profile',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
} as const;
