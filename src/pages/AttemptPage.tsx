import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizzesStore } from '@/entities/quiz/model/store';
import { Card, Button, Badge, Progress } from '@/shared/ui';
import type { AnswerSubmission } from '@/shared/api/types';

export function AttemptPage() {
  const navigate = useNavigate();
  const { currentAttempt, submitAttempt, isLoading } = useQuizzesStore();
  const [answers, setAnswers] = useState<Record<number, AnswerSubmission>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!currentAttempt) {
      navigate('/my-assignments');
      return;
    }

    // Инициализация таймера
    if (currentAttempt.time_limit_seconds) {
      const startTime = new Date(currentAttempt.started_at).getTime();
      const endTime = startTime + currentAttempt.time_limit_seconds * 1000;

      const timer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        setTimeRemaining(remaining);

        if (remaining === 0) {
          handleSubmit();
          clearInterval(timer);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentAttempt, navigate]);

  if (!currentAttempt) {
    return null;
  }

  const handleAnswerChange = (attemptQuestionId: number, answer: Partial<AnswerSubmission>) => {
    setAnswers({
      ...answers,
      [attemptQuestionId]: {
        attempt_question_id: attemptQuestionId,
        selected_option_ids: answer.selected_option_ids ?? [],
        text_answer: answer.text_answer ?? undefined,
      },
    });
  };

  const handleSubmit = async () => {
    if (!currentAttempt) return;

    const answersList = Object.values(answers);
    
    // Добавляем пустые ответы для неотвеченных вопросов
    currentAttempt.questions.forEach((q) => {
      if (!answers[q.attempt_question_id]) {
        answersList.push({
          attempt_question_id: q.attempt_question_id,
          selected_option_ids: [],
          text_answer: undefined,
        });
      }
    });

    try {
      await submitAttempt(currentAttempt.attempt_id, answersList);
      navigate(`/attempt-result/${currentAttempt.attempt_id}`);
    } catch (error) {
      // Ошибка уже в store
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = currentAttempt.questions.length;
  const progressPercent = (answeredCount / totalQuestions) * 100;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Шапка с таймером и прогрессом */}
      <Card className="p-6 sticky top-0 z-10 bg-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Прохождение теста</h1>
            <p className="text-sm text-gray-600">
              Отвечено: {answeredCount} из {totalQuestions}
            </p>
          </div>
          
          {timeRemaining !== null && (
            <div className="text-right">
              <p className="text-sm text-gray-500 mb-1">Осталось времени</p>
              <p className={`text-3xl font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-primary-600'}`}>
                {formatTime(timeRemaining)}
              </p>
            </div>
          )}
        </div>

        <Progress value={progressPercent} />

        <div className="flex gap-2 mt-4">
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={answeredCount === 0}
            className="flex-1"
          >
            Завершить тест
          </Button>
        </div>
      </Card>

      {/* Вопросы */}
      <div className="space-y-6">
        {currentAttempt.questions.map((q, index) => {
          const question = q.question;
          const currentAnswer = answers[q.attempt_question_id];
          const selectedOptionIds = currentAnswer?.selected_option_ids ?? [];

          return (
            <Card key={q.attempt_question_id} className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-700">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="primary">{question.type}</Badge>
                    {currentAnswer && (
                      <Badge variant="success">Отвечено</Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {question.text}
                  </h3>

                  {/* Одиночный выбор */}
                  {question.type === 'single' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <label
                          key={option.id}
                          className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedOptionIds.includes(option.id)
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${q.attempt_question_id}`}
                            checked={selectedOptionIds.includes(option.id)}
                            onChange={() => handleAnswerChange(q.attempt_question_id, {
                              selected_option_ids: [option.id],
                            })}
                            className="w-5 h-5 text-primary-600 border-gray-300 focus:ring-primary-500"
                          />
                          <span className="text-gray-900">{option.text}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Множественный выбор */}
                  {question.type === 'multiple' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option) => {
                        const isSelected = selectedOptionIds.includes(option.id);
                        
                        return (
                          <label
                            key={option.id}
                            className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                              isSelected
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-primary-300'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const current = selectedOptionIds;
                                const newIds = e.target.checked
                                  ? [...current, option.id]
                                  : current.filter(id => id !== option.id);
                                handleAnswerChange(q.attempt_question_id, {
                                  selected_option_ids: newIds,
                                });
                              }}
                              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                            />
                            <span className="text-gray-900">{option.text}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}

                  {/* Текстовый ответ */}
                  {question.type === 'text' && (
                    <textarea
                      value={currentAnswer?.text_answer || ''}
                      onChange={(e) => handleAnswerChange(q.attempt_question_id, {
                        text_answer: e.target.value,
                      })}
                      placeholder="Введите ваш ответ..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={4}
                    />
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Кнопка завершения внизу */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Готовы завершить тест?</p>
            <p className="text-sm text-gray-600">
              Вы ответили на {answeredCount} из {totalQuestions} вопросов
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={answeredCount === 0}
          >
            Завершить тест
          </Button>
        </div>
      </Card>
    </div>
  );
}
