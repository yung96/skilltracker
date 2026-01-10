import { useState } from 'react';
import { useQuizzesStore } from '@/entities/quiz/model/store';
import { Card, Badge, Button, Input, Textarea, Modal, ModalFooter } from '@/shared/ui';
import { Link } from 'react-router-dom';
import type { QuizSectionCreate } from '@/shared/api/types';

interface QuizSectionsProps {
  quizId: number;
}

export function QuizSections({ quizId }: QuizSectionsProps) {
  const { sections, questions, createSection, updateSection, deleteSection, isLoading } = useQuizzesStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [formData, setFormData] = useState<QuizSectionCreate>({
    title: '',
    description: '',
    order_index: 0,
    pick_count: undefined,
    question_ids: [],
  });

  const handleOpenModal = (section?: any) => {
    if (section) {
      setEditingSectionId(section.id);
      setFormData({
        title: section.title,
        description: section.description || '',
        order_index: section.order_index || 0,
        pick_count: section.pick_count,
        question_ids: section.questions?.map((q: any) => q.id) || [],
      });
    } else {
      setEditingSectionId(null);
      const maxOrder = sections.reduce((max, s) => Math.max(max, s.order_index || 0), -1);
      setFormData({
        title: '',
        description: '',
        order_index: maxOrder + 1,
        pick_count: undefined,
        question_ids: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSectionId) {
        await updateSection(quizId, editingSectionId, formData);
      } else {
        await createSection(quizId, formData);
      }
      setIsModalOpen(false);
    } catch (error) {
      // Ошибка уже в store
    }
  };

  const handleDelete = async (sectionId: number) => {
    if (!confirm('Удалить секцию?')) return;
    try {
      await deleteSection(quizId, sectionId);
    } catch (error) {
      // Ошибка уже в store
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => handleOpenModal()}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить секцию
        </Button>
      </div>

      {sections.length > 0 ? (
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                    <Badge variant="default">Порядок: {section.order_index}</Badge>
                    {section.pick_count && (
                      <Badge variant="primary">Выбрать {section.pick_count}</Badge>
                    )}
                  </div>
                  {section.description && (
                    <p className="text-sm text-gray-600 mb-3">{section.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => handleOpenModal(section)}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(section.id)}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>

              {section.questions && section.questions.length > 0 && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Вопросы ({section.questions.length}):
                  </p>
                  <div className="space-y-2">
                    {section.questions.map((question, index) => (
                      <div key={question.id} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-gray-400">{index + 1}.</span>
                        <span className="flex-1">{question.text}</span>
                        <Badge variant="default">{question.type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Секций пока нет. Добавьте первую секцию.</p>
        </div>
      )}

      {/* Модальное окно */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSectionId ? 'Редактировать секцию' : 'Создать секцию'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Название секции"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Textarea
            label="Описание"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
          />

          <Input
            label="Порядок"
            type="number"
            value={formData.order_index || 0}
            onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
            min={0}
          />

          <Input
            label="Выбрать вопросов (оставьте пустым для всех)"
            type="number"
            value={formData.pick_count || ''}
            onChange={(e) => setFormData({ ...formData, pick_count: e.target.value ? parseInt(e.target.value) : undefined })}
            min={1}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Выберите вопросы
            </label>
            <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
              {questions.length > 0 ? (
                questions.map((question) => (
                  <label key={question.id} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.question_ids?.includes(question.id)}
                      onChange={(e) => {
                        const newIds = e.target.checked
                          ? [...(formData.question_ids || []), question.id]
                          : (formData.question_ids || []).filter(id => id !== question.id);
                        setFormData({ ...formData, question_ids: newIds });
                      }}
                      className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{question.text}</p>
                      <p className="text-xs text-gray-500">Тип: {question.type}</p>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-2">
                  Нет доступных вопросов. <Link to="/questions" className="text-primary-600 hover:underline">Создайте вопросы</Link>
                </p>
              )}
            </div>
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {editingSectionId ? 'Сохранить' : 'Создать'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
