import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Loader, Card } from '@/shared/ui';
import { quizzesApi, usersApi, AttemptListItem, AssignmentDetail } from '@/shared/api';
import { useAuthStore } from '@/entities/user/model/store';
import { AssignmentInfo } from '@/features/quizzes/AssignmentInfo';
import { AttemptFilters } from '@/features/quizzes/AttemptFilters';
import { AttemptCard } from '@/features/quizzes/AttemptCard';

export function AssignmentAttemptsPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [attempts, setAttempts] = useState<AttemptListItem[]>([]);
  const [assignmentDetail, setAssignmentDetail] = useState<AssignmentDetail | null>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [employeeFilter, setEmployeeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const perPage = 20;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!assignmentId) return;

      try {
        setIsLoading(true);
        setError(null);
        
        const detail = await quizzesApi.getAssignmentDetail(parseInt(assignmentId));
        setAssignmentDetail(detail);

        if (user?.role === 'manager') {
          const usersData = await usersApi.getUsers({ role: 'employee' });
          setEmployees(usersData);
        }
      } catch (err: any) {
        console.error('Failed to fetch assignment details:', err);
        setError('Не удалось загрузить информацию о назначении');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [assignmentId, user?.role]);

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!assignmentId) return;

      try {
        const params: any = {};
        if (employeeFilter) params.employee_id = parseInt(employeeFilter);
        if (page > 1) {
          params.page = page;
          params.per_page = perPage;
        }

        const data = await quizzesApi.getAssignmentAttempts(parseInt(assignmentId), params);
        setAttempts(data);
      } catch (err: any) {
        console.error('Failed to fetch attempts:', err);
        setError('Не удалось загрузить попытки');
      }
    };

    fetchAttempts();
  }, [assignmentId, employeeFilter, page]);

  const handleEmployeeChange = (value: string) => {
    setEmployeeFilter(value);
    setPage(1);
  };

  if (isLoading && !assignmentDetail) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (error && !assignmentDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад
          </Button>
        </div>

        <Card className="p-8 text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Вернуться назад
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Назад
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Попытки прохождения</h1>
            {assignmentDetail && (
              <p className="text-gray-600 mt-1">
                Тест: {assignmentDetail.quiz.title}
                {assignmentDetail.task && ` • Задача: ${assignmentDetail.task.title}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Информация о назначении */}
      {assignmentDetail && <AssignmentInfo assignmentDetail={assignmentDetail} />}

      {/* Фильтры (для менеджеров) */}
      {user?.role === 'manager' && employees.length > 0 && (
        <AttemptFilters
          employeeFilter={employeeFilter}
          employees={employees}
          onEmployeeChange={handleEmployeeChange}
        />
      )}

      {/* Список попыток */}
      {attempts.length > 0 ? (
        <>
          <div className="space-y-4">
            {attempts.map((attempt) => (
              <AttemptCard key={attempt.id} attempt={attempt} />
            ))}
          </div>

          {/* Pagination */}
          {attempts.length === perPage && (
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
      ) : (
        <Card className="p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Нет попыток</h3>
          <p className="text-gray-600">
            {employeeFilter
              ? 'Этот сотрудник ещё не проходил тест'
              : 'Пользователь ещё не проходил этот тест'}
          </p>
        </Card>
      )}
    </div>
  );
}
