import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuizzesStore } from '@/entities/quiz/model/store';
import { Card, Badge, Button, Loader } from '@/shared/ui';
import { formatDate } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/config/constants';

export function AttemptResultPage() {
  const { id } = useParams<{ id: string }>();
  const { attemptResult, getAttempt, clearAttempt, isLoading } = useQuizzesStore();

  const attemptId = parseInt(id || '0');

  useEffect(() => {
    if (attemptId) {
      getAttempt(attemptId);
    }

    return () => {
      clearAttempt();
    };
  }, [attemptId, getAttempt, clearAttempt]);

  if (isLoading && !attemptResult) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (!attemptResult) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-1">Результат не найден</h3>
        <Link to={ROUTES.MY_ASSIGNMENTS}>
          <Button variant="secondary">К моим тестам</Button>
        </Link>
      </div>
    );
  }

  const isPassed = attemptResult.passed || false;
  const scorePercent = attemptResult.score_percent || 0;
  const hasAnswers = attemptResult.answers && attemptResult.answers.length > 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Результат */}
      <Card className="p-8 text-center">
        <div className="mb-6">
          {isPassed ? (
            <svg className="w-20 h-20 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-20 h-20 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isPassed ? 'Тест пройден!' : 'Тест не пройден'}
          </h1>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <Badge variant={isPassed ? 'success' : 'danger'} size="lg">
              {attemptResult.status === 'completed' && 'Завершено'}
              {attemptResult.status === 'expired' && 'Время истекло'}
              {attemptResult.status === 'in_progress' && 'В процессе'}
            </Badge>
          </div>

          <p className="text-6xl font-bold mb-2" style={{ color: isPassed ? '#10b981' : '#ef4444' }}>
            {scorePercent.toFixed(1)}%
          </p>
          
          <p className="text-gray-600">
            Ваш результат
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 mb-1">Начато</p>
            <p className="font-medium text-gray-900">{formatDate(attemptResult.started_at)}</p>
          </div>
          {attemptResult.finished_at && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Завершено</p>
              <p className="font-medium text-gray-900">{formatDate(attemptResult.finished_at)}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 justify-center">
          <Link to={ROUTES.MY_ASSIGNMENTS}>
            <Button variant="secondary">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              К моим тестам
            </Button>
          </Link>
        </div>
      </Card>

      {/* Детали ответов */}
      {hasAnswers ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Ваши ответы</h2>
          
          {attemptResult.answers.map((answer, index) => {
            const isCorrect = answer.is_correct;
            
            return (
              <Card key={answer.attempt_question_id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isCorrect ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {isCorrect ? (
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-medium text-gray-500">Вопрос {index + 1}</span>
                      <Badge variant={isCorrect ? 'success' : 'danger'}>
                        {isCorrect ? 'Правильно' : 'Неправильно'}
                      </Badge>
                    </div>

                    {answer.text_answer && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-1">Ваш ответ:</p>
                        <div className={`p-3 rounded-lg ${
                          isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                          <p className="text-gray-900">{answer.text_answer}</p>
                        </div>
                      </div>
                    )}

                    {answer.selected_option_ids && answer.selected_option_ids.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 mb-1">Выбрано вариантов: {answer.selected_option_ids.length}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Детали ответов недоступны
          </h3>
          <p className="text-gray-600">
            Преподаватель отключил возможность просмотра правильных ответов
          </p>
        </Card>
      )}
    </div>
  );
}
