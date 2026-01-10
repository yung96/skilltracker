import { create } from 'zustand';
import { authApi, usersApi, getErrorMessage } from '@/shared/api';
import type { User, LoginRequest, UserCreate } from '@/shared/api/types';
import { STORAGE_KEYS } from '@/shared/config/constants';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Действия
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: UserCreate) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  clearError: () => void;
}

/**
 * Store для управления аутентификацией
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(credentials);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
      set({ 
        user: response.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.register(data);
      // После регистрации автоматически логинимся
      await authApi.login({ username: data.username, password: data.password });
      const currentUser = await authApi.getCurrentUser();
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        set({ 
          user: currentUser, 
          isAuthenticated: true, 
          isLoading: false 
        });
      }
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    set({ isLoading: true });
    try {
      const user = await authApi.getCurrentUser();
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false 
      });
    } catch (error) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false,
        error: getErrorMessage(error)
      });
    }
  },

  clearError: () => set({ error: null }),
}));

interface UsersState {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Действия
  fetchUsers: (params?: {
    role?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }) => Promise<void>;
  fetchUser: (id: number) => Promise<void>;
  createUser: (data: UserCreate) => Promise<User>;
  updateUser: (id: number, data: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  clearError: () => void;
}

/**
 * Store для управления пользователями
 */
export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,

  fetchUsers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const users = await usersApi.getUsers(params);
      set({ users, isLoading: false });
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
    }
  },

  fetchUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const user = await usersApi.getUser(id);
      set({ selectedUser: user, isLoading: false });
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
    }
  },

  createUser: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await usersApi.createUser(data);
      set((state) => ({ 
        users: [...state.users, user], 
        isLoading: false 
      }));
      return user;
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      throw error;
    }
  },

  updateUser: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await usersApi.updateUser(id, data);
      set((state) => ({
        users: state.users.map((u) => (u.id === id ? updated : u)),
        selectedUser: state.selectedUser?.id === id ? updated : state.selectedUser,
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await usersApi.deleteUser(id);
      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
        selectedUser: state.selectedUser?.id === id ? null : state.selectedUser,
        isLoading: false,
      }));
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
