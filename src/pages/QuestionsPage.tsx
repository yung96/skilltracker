import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuizzesStore } from '@/entities/quiz/model/store';
import { Card, Badge, Button, Modal, Loader } from '@/shared/ui';
import { QuestionForm } from '@/features/quizzes/QuestionForm';
import type { Question, QuestionType } from '@/shared/api/types';

export function QuestionsPage() {
  const { questions, fetchQuestions, createQuestion, updateQuestion, deleteQuestion, isLoading } = useQuizzesStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [filter, setFilter] = useState<QuestionType | 'all'>('all');

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const filteredQuestions = filter === 'all' 
    ? questions 
    : questions.filter(q => q.type === filter);

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case 'single': return 'Одиночный выбор';
      case 'multiple': return 'Множественный выбор';
      case 'text': return 'Текстовый ответ';
      default: return type;
    }
  };

  const handleOpenModal = (question?: Question) => {
    setEditingQuestion(question || null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, data);
      } else {
        await createQuestion(data);
      }
      setIsModalOpen(false);
      setEditingQuestion(null);
    } catch (error) {
      // Ошибка уже в store
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      try {
        await deleteQuestion(id);
      } catch (error) {
        // Ошибка уже в store
      }
    }
  };

  if (isLoading && questions.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Банк вопросов</h1>
          <p className="text-gray-600 mt-1">
            Создавайте и управляйте вопросами для тестов
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/quizzes">
            <Button variant="secondary">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              К тестам
            </Button>
          </Link>
          <Button onClick={() => handleOpenModal()}>
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Создать вопрос
          </Button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex gap-2 overflow-x-auto">
        <Button
          variant={filter === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Все ({questions.length})
        </Button>
        <Button
          variant={filter === 'single' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('single')}
        >
          Одиночный выбор ({questions.filter(q => q.type === 'single').length})
        </Button>
        <Button
          variant={filter === 'multiple' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('multiple')}
        >
          Множественный выбор ({questions.filter(q => q.type === 'multiple').length})
        </Button>
        <Button
          variant={filter === 'text' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilter('text')}
        >
          Текстовый ответ ({questions.filter(q => q.type === 'text').length})
        </Button>
      </div>

      {/* Список вопросов */}
      <div className="space-y-4">
        {filteredQuestions.map((question) => (
          <Card key={question.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="primary">{getQuestionTypeLabel(question.type)}</Badge>
                  <span className="text-sm text-gray-500">ID: {question.id}</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {question.text}
                </h3>

                {question.type !== 'text' && question.options && question.options.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-sm font-medium text-gray-700">Варианты ответов:</p>
                    {question.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className={option.is_correct ? 'text-green-600 font-medium' : 'text-gray-600'}>
                          {option.is_correct && '✓ '}
                          {option.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'text' && question.text_answers && question.text_answers.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-sm font-medium text-gray-700">Правильные ответы:</p>
                    {question.text_answers.map((answer, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <Badge variant="default">{answer.matcher_type}</Badge>
                        <span>{answer.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {question.explanation && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                    <p className="text-sm text-blue-900">
                      <span className="font-medium">Объяснение:</span> {question.explanation}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={() => handleOpenModal(question)}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(question.id)}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Вопросов не найдено</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? 'Создайте первый вопрос'
              : 'Нет вопросов данного типа'}
          </p>
        </div>
      )}

      {/* Модальное окно */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingQuestion(null);
        }}
        title={editingQuestion ? 'Редактировать вопрос' : 'Создать вопрос'}
        size="xl"
      >
        <QuestionForm
          question={editingQuestion || undefined}
          questions={questions}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingQuestion(null);
          }}
          isLoading={isLoading}
        />
      </Modal>
    </div>
  );
}
