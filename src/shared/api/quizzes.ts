import { apiClient } from './client';
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
  QuizAssignmentUpdate,
  AssignmentListItem,
  AssignmentDetail,
  AttemptStartResponse,
  AttemptSubmitRequest,
  AttemptRead,
  AttemptListItem,
  QuizAnalytics,
  QuizQuestionsAnalytics,
} from './types';

/**
 * API методы для работы с тестами
 */
export const quizzesApi = {
  // ========== Тесты ==========
  
  /**
   * Получить список тестов с поддержкой поиска, фильтров и пагинации
   */
  async getQuizzes(params?: {
    status?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<Quiz[]> {
    const response = await apiClient.get<Quiz[]>('/quizzes', { params });
    return response.data;
  },

  /**
   * Создать тест (только для менеджеров)
   */
  async createQuiz(data: QuizCreate): Promise<Quiz> {
    const response = await apiClient.post<Quiz>('/quizzes', data);
    return response.data;
  },

  /**
   * Обновить тест (только для менеджеров)
   */
  async updateQuiz(id: number, data: QuizUpdate): Promise<Quiz> {
    const response = await apiClient.put<Quiz>(`/quizzes/${id}`, data);
    return response.data;
  },

  /**
   * Удалить тест (только для менеджеров)
   */
  async deleteQuiz(id: number): Promise<void> {
    await apiClient.delete(`/quizzes/${id}`);
  },

  // ========== Вопросы ==========

  /**
   * Получить список вопросов (только для менеджеров)
   */
  async getQuestions(type?: string): Promise<Question[]> {
    const response = await apiClient.get<Question[]>('/quizzes/questions', {
      params: type ? { question_type: type } : undefined,
    });
    return response.data;
  },

  /**
   * Получить вопрос по ID (только для менеджеров)
   */
  async getQuestion(id: number): Promise<Question> {
    const response = await apiClient.get<Question>(`/quizzes/questions/${id}`);
    return response.data;
  },

  /**
   * Создать вопрос (только для менеджеров)
   */
  async createQuestion(data: QuestionCreate): Promise<Question> {
    const response = await apiClient.post<Question>('/quizzes/questions', data);
    return response.data;
  },

  /**
   * Обновить вопрос (только для менеджеров)
   */
  async updateQuestion(id: number, data: QuestionCreate): Promise<Question> {
    const response = await apiClient.put<Question>(`/quizzes/questions/${id}`, data);
    return response.data;
  },

  /**
   * Удалить вопрос (только для менеджеров)
   */
  async deleteQuestion(id: number): Promise<void> {
    await apiClient.delete(`/quizzes/questions/${id}`);
  },

  // ========== Секции ==========

  /**
   * Получить секции теста (только для менеджеров)
   */
  async getSections(quizId: number): Promise<QuizSection[]> {
    const response = await apiClient.get<QuizSection[]>(`/quizzes/${quizId}/sections`);
    return response.data;
  },

  /**
   * Создать секцию (только для менеджеров)
   */
  async createSection(quizId: number, data: QuizSectionCreate): Promise<QuizSection> {
    const response = await apiClient.post<QuizSection>(`/quizzes/${quizId}/sections`, data);
    return response.data;
  },

  /**
   * Обновить секцию (только для менеджеров)
   */
  async updateSection(quizId: number, sectionId: number, data: QuizSectionUpdate): Promise<QuizSection> {
    const response = await apiClient.put<QuizSection>(`/quizzes/${quizId}/sections/${sectionId}`, data);
    return response.data;
  },

  /**
   * Удалить секцию (только для менеджеров)
   */
  async deleteSection(quizId: number, sectionId: number): Promise<void> {
    await apiClient.delete(`/quizzes/${quizId}/sections/${sectionId}`);
  },

  /**
   * Добавить вопросы в секцию (только для менеджеров)
   */
  async addQuestionsToSection(quizId: number, sectionId: number, questionIds: number[]): Promise<QuizSection> {
    const response = await apiClient.post<QuizSection>(
      `/quizzes/${quizId}/sections/${sectionId}/questions`,
      questionIds
    );
    return response.data;
  },

  // ========== Назначения ==========

  /**
   * Получить назначения теста (только для менеджеров)
   */
  async getAssignments(quizId: number): Promise<QuizAssignment[]> {
    const response = await apiClient.get<QuizAssignment[]>(`/quizzes/${quizId}/assignments`);
    return response.data;
  },

  /**
   * Создать назначение (только для менеджеров)
   */
  async createAssignment(quizId: number, data: QuizAssignmentCreate): Promise<QuizAssignment> {
    const response = await apiClient.post<QuizAssignment>(`/quizzes/${quizId}/assignments`, data);
    return response.data;
  },

  /**
   * Обновить назначение (только для менеджеров)
   */
  async updateAssignment(assignmentId: number, data: QuizAssignmentUpdate): Promise<QuizAssignment> {
    const response = await apiClient.put<QuizAssignment>(`/quizzes/assignments/${assignmentId}`, data);
    return response.data;
  },

  /**
   * Удалить назначение (только для менеджеров)
   */
  async deleteAssignment(assignmentId: number): Promise<void> {
    await apiClient.delete(`/quizzes/assignments/${assignmentId}`);
  },

  /**
   * Получить мои назначения
   */
  async getMyAssignments(): Promise<AssignmentListItem[]> {
    const response = await apiClient.get<AssignmentListItem[]>('/quizzes/assignments/my');
    return response.data;
  },

  /**
   * Получить детали назначения
   */
  async getAssignmentDetail(assignmentId: number): Promise<AssignmentDetail> {
    const response = await apiClient.get<AssignmentDetail>(`/quizzes/assignments/${assignmentId}`);
    return response.data;
  },

  /**
   * Получить попытки по назначению
   */
  async getAssignmentAttempts(
    assignmentId: number,
    params?: {
      employee_id?: number;
      page?: number;
      per_page?: number;
    }
  ): Promise<AttemptListItem[]> {
    const response = await apiClient.get<AttemptListItem[]>(
      `/quizzes/assignments/${assignmentId}/attempts`,
      { params }
    );
    return response.data;
  },

  // ========== Попытки ==========

  /**
   * Начать попытку прохождения теста
   */
  async startAttempt(quizId: number): Promise<AttemptStartResponse> {
    const response = await apiClient.post<AttemptStartResponse>(`/quizzes/${quizId}/attempts`);
    return response.data;
  },

  /**
   * Отправить ответы и завершить попытку
   */
  async submitAttempt(attemptId: number, data: AttemptSubmitRequest): Promise<AttemptRead> {
    const response = await apiClient.post<AttemptRead>(`/quizzes/attempts/${attemptId}/submit`, data);
    return response.data;
  },

  /**
   * Получить результаты попытки
   */
  async getAttempt(attemptId: number): Promise<AttemptRead> {
    const response = await apiClient.get<AttemptRead>(`/quizzes/attempts/${attemptId}`);
    return response.data;
  },

  /**
   * Получить попытки по тесту (только для менеджеров)
   */
  async getQuizAttempts(
    quizId: number,
    params?: {
      user_id?: number;
      assignment_id?: number;
      status_filter?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<AttemptListItem[]> {
    const response = await apiClient.get<AttemptListItem[]>(`/quizzes/${quizId}/attempts`, { params });
    return response.data;
  },

  // ========== Аналитика ==========

  /**
   * Получить аналитику теста (только для менеджеров)
   */
  async getAnalytics(quizId: number): Promise<QuizAnalytics> {
    const response = await apiClient.get<QuizAnalytics>(`/quizzes/${quizId}/analytics`);
    return response.data;
  },

  /**
   * Получить аналитику по вопросам теста (только для менеджеров)
   */
  async getQuestionsAnalytics(quizId: number): Promise<QuizQuestionsAnalytics> {
    const response = await apiClient.get<QuizQuestionsAnalytics>(`/quizzes/${quizId}/analytics/questions`);
    return response.data;
  },
};
