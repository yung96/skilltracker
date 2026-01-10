import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasksStore } from '@/entities/task/model/store';
import { useUsersStore } from '@/entities/user/model/store';
import { Card, Input, Textarea, Select, Button } from '@/shared/ui';
import { ROUTES } from '@/shared/config/constants';
import type { TaskCreate, TaskStatus } from '@/shared/api/types';

export function TaskCreatePage() {
  const navigate = useNavigate();
  const { createTask, isLoading } = useTasksStore();
  const { users, fetchUsers } = useUsersStore();
  
  const [formData, setFormData] = useState<TaskCreate>({
    employee_id: 0,
    title: '',
    description: '',
    status: 'pending',
    progress: 0,
  });

  // Загружаем сотрудников при монтировании
  useEffect(() => {
    fetchUsers({ role: 'employee' });
  }, [fetchUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTask(formData);
      navigate(ROUTES.TASKS);
    } catch (error) {
      // Ошибка уже обрабатывается в store
    }
  };

  const handleCancel = () => {
    navigate(ROUTES.TASKS);
  };

  const employeeOptions = users
    .filter(u => u.role === 'employee')
    .map(u => ({ value: String(u.id), label: u.name }));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Создать задачу</h1>
        <p className="text-gray-600 mt-1">
          Создайте новую задачу и назначьте её сотруднику
        </p>
      </div>

      {/* Форма */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Название задачи"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Например: Разработать новую функцию"
          />

          <Textarea
            label="Описание"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Опишите задачу подробнее..."
            rows={5}
          />

          <Select
            label="Назначить сотруднику"
            value={String(formData.employee_id)}
            onChange={(e) => setFormData({ ...formData, employee_id: parseInt(e.target.value) })}
            options={[
              { value: '0', label: 'Выберите сотрудника' },
              ...employeeOptions,
            ]}
            required
          />

          <Input
            label="Дедлайн"
            type="date"
            value={formData.deadline || ''}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
          />

          <Select
            label="Статус"
            value={formData.status || 'pending'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
            options={[
              { value: 'pending', label: 'Ожидает' },
              { value: 'in_progress', label: 'В работе' },
              { value: 'done', label: 'Выполнено' },
            ]}
          />

          <Input
            label="Прогресс (%)"
            type="number"
            value={formData.progress || 0}
            onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
            min={0}
            max={100}
          />

          {/* Кнопки */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              className="flex-1"
              disabled={!formData.title || formData.employee_id === 0}
            >
              Создать задачу
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
