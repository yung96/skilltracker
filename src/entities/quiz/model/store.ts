import { create } from 'zustand';
import { quizzesApi, getErrorMessage } from '@/shared/api';
import type {
  Quiz,
  QuizCreate,
  QuizUpdate,
  Question,
  QuestionCreate,
  QuizSection,
  QuizSectionCreate,
  QuizSectionUpdate,
  QuizAssignment,
  QuizAssignmentCreate,
  AssignmentListItem,
  AttemptStartResponse,
  AttemptRead,
  QuizAnalytics,
  AnswerSubmission,
} from '@/shared/api/types';

interface QuizzesState {
  quizzes: Quiz[];
  selectedQuiz: Quiz | null;
  questions: Question[];
  sections: QuizSection[];
  assignments: QuizAssignment[];
  myAssignments: AssignmentListItem[];
  currentAttempt: AttemptStartResponse | null;
  attemptResult: AttemptRead | null;
  analytics: QuizAnalytics | null;
  isLoading: boolean;
  error: string | null;
  
  // Действия для тестов
  fetchQuizzes: (params?: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }) => Promise<void>;
  createQuiz: (data: QuizCreate) => Promise<Quiz>;
  updateQuiz: (id: number, data: QuizUpdate) => Promise<void>;
  deleteQuiz: (id: number) => Promise<void>;
  
  // Действия для вопросов
  fetchQuestions: (type?: string) => Promise<void>;
  createQuestion: (data: QuestionCreate) => Promise<Question>;
  updateQuestion: (id: number, data: QuestionCreate) => Promise<void>;
  deleteQuestion: (id: number) => Promise<void>;
  
  // Действия для секций
  fetchSections: (quizId: number) => Promise<void>;
  createSection: (quizId: number, data: QuizSectionCreate) => Promise<void>;
  updateSection: (quizId: number, sectionId: number, data: QuizSectionUpdate) => Promise<void>;
  deleteSection: (quizId: number, sectionId: number) => Promise<void>;
  
  // Действия для назначений
  fetchAssignments: (quizId: number) => Promise<void>;
  createAssignment: (quizId: number, data: QuizAssignmentCreate) => Promise<void>;
  deleteAssignment: (assignmentId: number) => Promise<void>;
  fetchMyAssignments: () => Promise<void>;
  
  // Действия для попыток
  startAttempt: (quizId: number) => Promise<void>;
  submitAttempt: (attemptId: number, answers: AnswerSubmission[]) => Promise<void>;
  getAttempt: (attemptId: number) => Promise<void>;
  clearAttempt: () => void;
  
  // Аналитика
  fetchAnalytics: (quizId: number) => Promise<void>;
  
  clearError: () => void;
}

/**
 * Store для управления тестами
 */
export const useQuizzesStore = create<QuizzesState>((set) => ({
  quizzes: [],
  selectedQuiz: null,
  questions: [],
  sections: [],
  assignments: [],
  myAssignments: [],
  currentAttempt: null,
  attemptResult: null,
  analytics: null,
  isLoading: false,
  error: null,

  // ========== Тесты ==========

  fetchQuizzes: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const quizzes = await quizzesApi.getQuizzes(params);
      set({ quizzes, isLoading: false });
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
    }
  },

  createQuiz: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const quiz = await quizzesApi.createQuiz(data);
      set((state) => ({ 
        quizzes: [quiz, ...state.quizzes], 
        isLoading: false 
      }));
      return quiz;
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      throw error;
    }
  },

  updateQuiz: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await quizzesApi.updateQuiz(id, data);
      set((state) => ({
        quizzes: state.quizzes.map((q) => (q.id === id ? updated : q)),
        selectedQuiz: state.selectedQuiz?.id === id ? updated : state.selectedQuiz,
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

  deleteQuiz: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await quizzesApi.deleteQuiz(id);
      set((state) => ({
        quizzes: state.quizzes.filter((q) => q.id !== id),
        selectedQuiz: state.selectedQuiz?.id === id ? null : state.selectedQuiz,
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

  // ========== Вопросы ==========

  fetchQuestions: async (type) => {
    set({ isLoading: true, error: null });
    try {
      const questions = await quizzesApi.getQuestions(type);
      set({ questions, isLoading: false });
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
    }
  },

  createQuestion: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const question = await quizzesApi.createQuestion(data);
      set((state) => ({ 
        questions: [question, ...state.questions], 
        isLoading: false 
      }));
      return question;
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      throw error;
    }
  },

  updateQuestion: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await quizzesApi.updateQuestion(id, data);
      set((state) => ({
        questions: state.questions.map((q) => (q.id === id ? updated : q)),
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

  deleteQuestion: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await quizzesApi.deleteQuestion(id);
      set((state) => ({
        questions: state.questions.filter((q) => q.id !== id),
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

  // ========== Секции ==========

  fetchSections: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      const sections = await quizzesApi.getSections(quizId);
      set({ sections, isLoading: false });
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
    }
  },

  createSection: async (quizId, data) => {
    set({ isLoading: true, error: null });
    try {
      const section = await quizzesApi.createSection(quizId, data);
      set((state) => ({ 
        sections: [...state.sections, section], 
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      throw error;
    }
  },

  updateSection: async (quizId, sectionId, data) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await quizzesApi.updateSection(quizId, sectionId, data);
      set((state) => ({
        sections: state.sections.map((s) => (s.id === sectionId ? updated : s)),
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

  deleteSection: async (quizId, sectionId) => {
    set({ isLoading: true, error: null });
    try {
      await quizzesApi.deleteSection(quizId, sectionId);
      set((state) => ({
        sections: state.sections.filter((s) => s.id !== sectionId),
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

  // ========== Назначения ==========

  fetchAssignments: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      const assignments = await quizzesApi.getAssignments(quizId);
      set({ assignments, isLoading: false });
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
    }
  },

  createAssignment: async (quizId, data) => {
    set({ isLoading: true, error: null });
    try {
      const assignment = await quizzesApi.createAssignment(quizId, data);
      set((state) => ({ 
        assignments: [...state.assignments, assignment], 
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteAssignment: async (assignmentId) => {
    set({ isLoading: true, error: null });
    try {
      await quizzesApi.deleteAssignment(assignmentId);
      set((state) => ({
        assignments: state.assignments.filter((a) => a.id !== assignmentId),
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

  fetchMyAssignments: async () => {
    set({ isLoading: true, error: null });
    try {
      const myAssignments = await quizzesApi.getMyAssignments();
      set({ myAssignments, isLoading: false });
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
    }
  },

  // ========== Попытки ==========

  startAttempt: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      const attempt = await quizzesApi.startAttempt(quizId);
      set({ currentAttempt: attempt, isLoading: false });
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
      throw error;
    }
  },

  submitAttempt: async (attemptId, answers) => {
    set({ isLoading: true, error: null });
    try {
      const result = await quizzesApi.submitAttempt(attemptId, { answers });
      set({ 
        attemptResult: result, 
        currentAttempt: null, 
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

  getAttempt: async (attemptId) => {
    set({ isLoading: true, error: null });
    try {
      const result = await quizzesApi.getAttempt(attemptId);
      set({ attemptResult: result, isLoading: false });
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
    }
  },

  clearAttempt: () => set({ currentAttempt: null, attemptResult: null }),

  // ========== Аналитика ==========

  fetchAnalytics: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      const analytics = await quizzesApi.getAnalytics(quizId);
      set({ analytics, isLoading: false });
    } catch (error) {
      set({ 
        error: getErrorMessage(error), 
        isLoading: false 
      });
    }
  },

  // ========== Утилиты ==========

  clearError: () => set({ error: null }),
}));
