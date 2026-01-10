import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuizzesStore } from '@/entities/quiz/model/store';
import { Button, Loader } from '@/shared/ui';
import { QuizFilters } from '@/features/quizzes/QuizFilters';
import { QuizCard } from '@/features/quizzes/QuizCard';
import { QuizCreateModal } from '@/features/quizzes/QuizCreateModal';

export function QuizzesPage() {
  const { quizzes, fetchQuizzes, createQuiz, deleteQuiz, isLoading } = useQuizzesStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    const params: any = {};
    if (statusFilter) params.status = statusFilter;
    if (search) params.search = search;
    if (page > 1) {
      params.page = page;
      params.per_page = perPage;
    }
    fetchQuizzes(params);
  }, [search, statusFilter, page, fetchQuizzes]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleCreate = async (data: any) => {
    await createQuiz(data);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот тест?')) {
      await deleteQuiz(id);
    }
  };

  if (isLoading && quizzes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Тесты</h1>
          <p className="text-gray-600 mt-1">
            Управление тестами и вопросами
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/questions">
            <Button variant="secondary">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Вопросы
            </Button>
          </Link>
          <Button onClick={() => setIsModalOpen(true)}>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Создать тест
          </Button>
        </div>
      </div>

      {/* Фильтры */}
      <QuizFilters
        search={search}
        statusFilter={statusFilter}
        quizzes={quizzes}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
      />

      {/* Список тестов */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} onDelete={handleDelete} />
            ))}
          </div>

          {quizzes.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Тестов не найдено</h3>
              <p className="text-gray-600">
                {search || statusFilter
                  ? 'Попробуйте изменить параметры поиска'
                  : 'Создайте первый тест'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {quizzes.length === perPage && (
            <div className="flex justify-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Предыдущая
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => p + 1)}
              >
                Следующая
              </Button>
            </div>
          )}
        </>
      )}

      {/* Модальное окно создания теста */}
      <QuizCreateModal
        isOpen={isModalOpen}
        isLoading={isLoading}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
