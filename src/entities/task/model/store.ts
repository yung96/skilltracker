import { create } from 'zustand';
import { tasksApi, getErrorMessage } from '@/shared/api';
import type { 
  Task, 
  TaskCreate, 
  TaskUpdate, 
  ProgressUpdate,
  Comment,
  Attachment,
} from '@/shared/api/types';

interface TasksState {
  tasks: Task[];
  selectedTask: Task | null;
  comments: Comment[];
  attachments: Attachment[];
  isLoading: boolean;
  error: string | null;
  
  // Действия для задач
  fetchTasks: (params?: {
    status?: string;
    employee_id?: number;
    search?: string;
    page?: number;
    per_page?: number;
  }) => Promise<void>;
  fetchTask: (id: number) => Promise<void>;
  createTask: (data: TaskCreate) => Promise<Task>;
  updateTask: (id: number, data: TaskUpdate) => Promise<void>;
  updateProgress: (id: number, data: ProgressUpdate) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  
  // Действия для комментариев
  fetchComments: (taskId: number) => Promise<void>;
  addComment: (taskId: number, text: string) => Promise<void>;
  updateComment: (taskId: number, commentId: number, text: string) => Promise<void>;
  deleteComment: (taskId: number, commentId: number) => Promise<void>;
  
  // Действия для вложений
  fetchAttachments: (taskId: number) => Promise<void>;
  uploadAttachment: (taskId: number, file: File) => Promise<void>;
  deleteAttachment: (taskId: number, attachmentId: number) => Promise<void>;
  
  clearError: () => void;
  clearSelectedTask: () => void;
}

/**
 * Store для управления задачами
 */
export const useTasksStore = create<TasksState>((set) => ({
  tasks: [],
  selectedTask: null,
  comments: [],
  attachments: [],
  isLoading: false,
  error: null,

  // ========== Задачи ==========

  fetchTasks: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await tasksApi.getTasks(params);
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
    }
  },

  fetchTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const task = await tasksApi.getTask(id);
      set({ selectedTask: task, isLoading: false });
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
    }
  },

  createTask: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const task = await tasksApi.createTask(data);
      set((state) => ({ 
        tasks: [task, ...state.tasks], 
        isLoading: false 
      }));
      return task;
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      throw error;
    }
  },

  updateTask: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await tasksApi.updateTask(id, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
        selectedTask: state.selectedTask?.id === id ? updated : state.selectedTask,
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

  updateProgress: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await tasksApi.updateProgress(id, data);
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? updated : t)),
        selectedTask: state.selectedTask?.id === id ? updated : state.selectedTask,
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

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await tasksApi.deleteTask(id);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
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

  // ========== Комментарии ==========

  fetchComments: async (taskId) => {
    try {
      const comments = await tasksApi.getComments(taskId);
      set({ comments });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },

  addComment: async (taskId, text) => {
    try {
      const comment = await tasksApi.addComment(taskId, { text });
      set((state) => ({ 
        comments: [...state.comments, comment] 
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  updateComment: async (taskId, commentId, text) => {
    try {
      const updated = await tasksApi.updateComment(taskId, commentId, { text });
      set((state) => ({
        comments: state.comments.map((c) => (c.id === commentId ? updated : c)),
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  deleteComment: async (taskId, commentId) => {
    try {
      await tasksApi.deleteComment(taskId, commentId);
      set((state) => ({
        comments: state.comments.filter((c) => c.id !== commentId),
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  // ========== Вложения ==========

  fetchAttachments: async (taskId) => {
    try {
      const attachments = await tasksApi.getAttachments(taskId);
      set({ attachments });
    } catch (error) {
      set({ error: getErrorMessage(error) });
    }
  },

  uploadAttachment: async (taskId, file) => {
    try {
      const attachment = await tasksApi.uploadAttachment(taskId, file);
      set((state) => ({ 
        attachments: [...state.attachments, attachment] 
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  deleteAttachment: async (taskId, attachmentId) => {
    try {
      await tasksApi.deleteAttachment(taskId, attachmentId);
      set((state) => ({
        attachments: state.attachments.filter((a) => a.id !== attachmentId),
      }));
    } catch (error) {
      set({ error: getErrorMessage(error) });
      throw error;
    }
  },

  // ========== Утилиты ==========

  clearError: () => set({ error: null }),
  clearSelectedTask: () => set({ selectedTask: null, comments: [], attachments: [] }),
}));
