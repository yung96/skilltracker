import { useState, useEffect } from 'react';
import { Input, Textarea, Select, Button, Modal, ModalFooter } from '@/shared/ui';
import type { Quiz, QuizUpdate } from '@/shared/api/types';

interface QuizEditFormProps {
  quiz: Quiz;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuizUpdate) => Promise<void>;
  isLoading: boolean;
}

export function QuizEditForm({ quiz, isOpen, onClose, onSubmit, isLoading }: QuizEditFormProps) {
  const [formData, setFormData] = useState<QuizUpdate>({
    title: '',
    description: '',
    status: 'draft',
    pass_percent: 70,
    time_limit_seconds: undefined,
    shuffle_questions: false,
    shuffle_answers: false,
    allow_review: true,
    max_attempts: undefined,
  });

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description || '',
        status: quiz.status,
        pass_percent: quiz.pass_percent || 70,
        time_limit_seconds: quiz.time_limit_seconds,
        shuffle_questions: quiz.shuffle_questions || false,
        shuffle_answers: quiz.shuffle_answers || false,
        allow_review: quiz.allow_review || false,
        max_attempts: quiz.max_attempts,
      });
    }
  }, [quiz]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактировать тест" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Название"
          value={formData.title || ''}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />

        <Textarea
          label="Описание"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />

        <Select
          label="Статус"
          value={formData.status || 'draft'}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
          options={[
            { value: 'draft', label: 'Черновик' },
            { value: 'published', label: 'Опубликован' },
          ]}
        />

        <Input
          label="Проходной балл (%)"
          type="number"
          value={formData.pass_percent || 70}
          onChange={(e) => setFormData({ ...formData, pass_percent: parseInt(e.target.value) })}
          min={0}
          max={100}
        />

        <Input
          label="Ограничение времени (секунды)"
          type="number"
          value={formData.time_limit_seconds || ''}
          onChange={(e) => setFormData({ ...formData, time_limit_seconds: e.target.value ? parseInt(e.target.value) : undefined })}
          min={0}
        />

        <Input
          label="Максимум попыток"
          type="number"
          value={formData.max_attempts || ''}
          onChange={(e) => setFormData({ ...formData, max_attempts: e.target.value ? parseInt(e.target.value) : undefined })}
          min={1}
        />

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.shuffle_questions || false}
              onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">Перемешивать вопросы</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.shuffle_answers || false}
              onChange={(e) => setFormData({ ...formData, shuffle_answers: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">Перемешивать ответы</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.allow_review || false}
              onChange={(e) => setFormData({ ...formData, allow_review: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-700">Разрешить просмотр результатов</span>
          </label>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Сохранить
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
