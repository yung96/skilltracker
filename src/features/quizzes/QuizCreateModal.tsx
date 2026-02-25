import { useState } from 'react';
import { Modal, ModalFooter, Input, Textarea, Button } from '@/shared/ui';
import type { QuizCreate } from '@/shared/api/types';

interface QuizCreateModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onCreate: (data: QuizCreate) => Promise<void>;
}

export function QuizCreateModal({
  isOpen,
  isLoading,
  onClose,
  onCreate,
}: QuizCreateModalProps) {
  const [formData, setFormData] = useState<QuizCreate>({
    title: '',
    description: '',
    pass_percent: 70,
    publish: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(formData);
    setFormData({
      title: '',
      description: '',
      pass_percent: 70,
      publish: false,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Создать тест"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Название теста"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          placeholder="Введите название теста"
        />

        <Textarea
          label="Описание"
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Опишите тест"
          rows={3}
        />

        <Input
          label="Процент для прохождения"
          type="number"
          value={formData.pass_percent || 70}
          onChange={(e) => setFormData({ ...formData, pass_percent: parseInt(e.target.value) })}
          min={0}
          max={100}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="publish"
            checked={formData.publish || false}
            onChange={(e) => setFormData({ ...formData, publish: e.target.checked })}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="publish" className="text-sm font-medium text-gray-700">
            Опубликовать сразу
          </label>
        </div>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Создать
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
