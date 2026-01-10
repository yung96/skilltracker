import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizzesStore } from '@/entities/quiz/model/store';
import { Card, Badge, Button, Loader } from '@/shared/ui';
import { formatDate } from '@/shared/lib/utils';

export function MyAssignmentsPage() {
  const navigate = useNavigate();
  const { myAssignments, fetchMyAssignments, startAttempt, isLoading } = useQuizzesStore();

  useEffect(() => {
    fetchMyAssignments();
  }, [fetchMyAssignments]);

  const handleStartQuiz = async (quizId: number) => {
    try {
      await startAttempt(quizId);
      // Перенаправим на страницу прохождения теста
      navigate('/attempt');
    } catch (error) {
      // Ошибка уже в store
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Мои тесты</h1>
        <p className="text-gray-600 mt-1">
          Тесты, назначенные вам для прохождения
        </p>
      </div>

      {/* Список назначений */}
      <div className="space-y-4">
        {myAssignments.map((item) => (
          <Card key={item.assignment.id} className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.quiz.title}
                    </h3>
                    {item.quiz.description && (
                      <p className="text-sm text-gray-600 mb-2">
                        {item.quiz.description}
                      </p>
                    )}
                  </div>
                  {item.assignment.required && (
                    <Badge variant="danger">Обязательно</Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Проходной балл: {item.quiz.pass_percent}%</span>
                  </div>
                  {item.quiz.time_limit_seconds && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Время: {Math.floor(item.quiz.time_limit_seconds / 60)} мин.</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>
                      Попыток: {item.assignment.attempts_taken}
                      {item.assignment.remaining_attempts !== null &&
                        item.assignment.remaining_attempts !== undefined &&
                        ` / Осталось: ${item.assignment.remaining_attempts}`}
                    </span>
                  </div>
                  {item.assignment.due_at && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>До: {formatDate(item.assignment.due_at)}</span>
                    </div>
                  )}
                </div>

                {item.task && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span>Связан с задачей: {item.task.title}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleStartQuiz(item.quiz.id)}
                  disabled={item.assignment.remaining_attempts === 0}
                >
                  {item.assignment.attempts_taken > 0 ? 'Пройти снова' : 'Начать тест'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {myAssignments.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Нет назначенных тестов</h3>
          <p className="text-gray-600">Вам еще не назначены тесты для прохождения</p>
        </div>
      )}
    </div>
  );
}
