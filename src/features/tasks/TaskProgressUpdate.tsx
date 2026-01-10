import { useState, useEffect } from 'react';
import { Button, Progress, Modal, ModalFooter } from '@/shared/ui';
import type { Task, ProgressUpdate } from '@/shared/api/types';

interface TaskProgressUpdateProps {
  task: Task;
  onUpdate: (taskId: number, data: ProgressUpdate) => Promise<void>;
  isLoading: boolean;
}

export function TaskProgressUpdate({ task, onUpdate, isLoading }: TaskProgressUpdateProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    setProgressValue(task.progress || 0);
  }, [task.progress]);

  const handleUpdate = async () => {
    const data: ProgressUpdate = {
      progress: progressValue,
    };

    // Автоматически обновляем статус на основе прогресса
    if (progressValue === 0) {
      data.status = 'pending';
    } else if (progressValue === 100) {
      data.status = 'done';
    } else {
      data.status = 'in_progress';
    }

    try {
      await onUpdate(task.id, data);
      setIsModalOpen(false);
    } catch (error) {
      // Ошибка уже в store
    }
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">Прогресс</h3>
          <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>
            Обновить прогресс
          </Button>
        </div>
        <Progress value={task.progress || 0} />
        <p className="text-sm text-gray-500 mt-1">{task.progress}% выполнено</p>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Обновить прогресс"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Прогресс: {progressValue}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={progressValue}
              onChange={(e) => setProgressValue(parseInt(e.target.value))}
              className="w-full"
            />
            <Progress value={progressValue} className="mt-2" />
          </div>

          <ModalFooter>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdate} isLoading={isLoading}>
              Сохранить
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </>
  );
}
