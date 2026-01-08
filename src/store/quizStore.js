import { create } from 'zustand';
import { api } from '../api';

export const useQuizStore = create((set, get) => ({
  // State
  quizzes: [],
  assignments: [],
  currentAttempt: null,
  currentAttemptData: null,
  answers: {},
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  // Fetch quizzes (all for manager, assigned for employee)
  fetchQuizzes: async () => {
    set({ loading: true, error: null });
    try {
      const quizzes = await api.getQuizzes();
      set({ quizzes, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Fetch my assignments (for employees)
  fetchAssignments: async () => {
    set({ loading: true, error: null });
    try {
      const assignments = await api.getMyAssignments();
      set({ assignments, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Start quiz attempt
  startAttempt: async (quizId) => {
    set({ loading: true, error: null });
    try {
      const attemptData = await api.startAttempt(quizId);
      set({
        currentAttempt: attemptData.attempt_id,
        currentAttemptData: attemptData,
        answers: {},
        loading: false,
      });
      return attemptData;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Set answer for a question
  setAnswer: (attemptQuestionId, selectedOptionIds, textAnswer) => {
    const { answers } = get();
    set({
      answers: {
        ...answers,
        [attemptQuestionId]: {
          attempt_question_id: attemptQuestionId,
          selected_option_ids: selectedOptionIds || [],
          text_answer: textAnswer || null,
        },
      },
    });
  },

  // Submit attempt
  submitAttempt: async (attemptId) => {
    set({ loading: true, error: null });
    try {
      const { answers } = get();
      const answersArray = Object.values(answers);
      const result = await api.submitAttempt(attemptId, answersArray);
      set({
        currentAttempt: null,
        currentAttemptData: null,
        answers: {},
        loading: false,
      });
      return result;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Get attempt details
  getAttempt: async (attemptId) => {
    set({ loading: true, error: null });
    try {
      const attempt = await api.getAttempt(attemptId);
      set({ loading: false });
      return attempt;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Reset current attempt (cancel)
  resetAttempt: () => set({
    currentAttempt: null,
    currentAttemptData: null,
    answers: {},
  }),

  // Clear error
  clearError: () => set({ error: null }),
}));

