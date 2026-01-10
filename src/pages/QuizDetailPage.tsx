import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuizzesStore } from '@/entities/quiz/model/store';
import { useAuthStore, useUsersStore } from '@/entities/user/model/store';
import { useTasksStore } from '@/entities/task/model/store';
import { Card, Badge, Button } from '@/shared/ui';
import { formatDate } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/config/constants';
import { QuizSections } from '@/features/quizzes/QuizSections';
import { QuizAssignments } from '@/features/quizzes/QuizAssignments';
import { QuizAnalytics } from '@/features/quizzes/QuizAnalytics';
import { QuizEditForm } from '@/features/quizzes/QuizEditForm';
import type { QuizUpdate } from '@/shared/api/types';

type TabType = 'sections' | 'assignments' | 'analytics';

export function QuizDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { 
    quizzes,
    analytics,
    fetchSections,
    fetchAssignments,
    fetchQuestions,
    fetchAnalytics,
    updateQuiz,
    isLoading 
  } = useQuizzesStore();
  const { fetchTasks } = useTasksStore();
  const { fetchUsers } = useUsersStore();

  const [activeTab, setActiveTab] = useState<TabType>('sections');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const quizId = parseInt(id || '0');
  const quiz = quizzes.find(q => q.id === quizId);
  const isManager = user?.role === 'manager';

  useEffect(() => {
    if (quizId && isManager) {
      fetchSections(quizId);
      fetchAssignments(quizId);
      fetchAnalytics(quizId);
      fetchQuestions();
      fetchTasks();
      fetchUsers();
    }
  }, [quizId, isManager, fetchSections, fetchAssignments, fetchAnalytics, fetchQuestions, fetchTasks, fetchUsers]);

  const handleUpdateQuiz = async (data: QuizUpdate) => {
    if (!quizId) return;
    try {
      await updateQuiz(quizId, data);
      setIsEditModalOpen(false);
    } catch (error) {
      // Ошибка уже в store
    }
  };

  if (!isManager) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-1">Доступ запрещён</h3>
        <p className="text-gray-600 mb-4">Эта страница доступна только менеджерам</p>
        <Link to={ROUTES.DASHBOARD}>
          <Button variant="secondary">На главную</Button>
        </Link>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-1">Тест не найден</h3>
        <Link to={ROUTES.QUIZZES}>
          <Button variant="secondary">Вернуться к тестам</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={ROUTES.QUIZZES}>
            <Button variant="secondary" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Назад
            </Button>
          </Link>
          <Badge variant={quiz.status === 'published' ? 'success' : 'warning'}>
            {quiz.status === 'published' ? 'Опубликован' : 'Черновик'}
          </Badge>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Редактировать
        </Button>
      </div>

      {/* Основная информация */}
      <Card className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{quiz.title}</h1>
        
        {quiz.description && (
          <p className="text-gray-700 mb-6 whitespace-pre-wrap">{quiz.description}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Проходной балл</p>
            <p className="text-2xl font-bold text-primary-600">{quiz.pass_percent}%</p>
          </div>
          {quiz.time_limit_seconds && (
            <div>
              <p className="text-sm text-gray-500">Ограничение времени</p>
              <p className="text-2xl font-bold text-gray-900">{Math.floor(quiz.time_limit_seconds / 60)} мин</p>
            </div>
          )}
          {quiz.max_attempts && (
            <div>
              <p className="text-sm text-gray-500">Макс. попыток</p>
              <p className="text-2xl font-bold text-gray-900">{quiz.max_attempts}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500">Создан</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(quiz.created_at)}</p>
          </div>
        </div>
      </Card>

      {/* Вкладки */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('sections')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sections'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Секции и вопросы
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'assignments'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Назначения
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Аналитика
          </button>
        </nav>
      </div>

      {/* Контент вкладок */}
      {activeTab === 'sections' && <QuizSections quizId={quizId} />}
      {activeTab === 'assignments' && <QuizAssignments quizId={quizId} />}
      {activeTab === 'analytics' && <QuizAnalytics analytics={analytics} />}

      {/* Модальное окно редактирования */}
      <QuizEditForm
        quiz={quiz}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateQuiz}
        isLoading={isLoading}
      />
    </div>
  );
}
