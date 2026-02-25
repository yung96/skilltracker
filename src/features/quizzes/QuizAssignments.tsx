import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuizzesStore } from '@/entities/quiz/model/store';
import { useTasksStore } from '@/entities/task/model/store';
import { useUsersStore } from '@/entities/user/model/store';
import { Card, Badge, Button, Select, Modal, ModalFooter } from '@/shared/ui';
import { formatDate } from '@/shared/lib/utils';
import type { QuizAssignmentCreate } from '@/shared/api/types';

interface QuizAssignmentsProps {
  quizId: number;
}

export function QuizAssignments({ quizId }: QuizAssignmentsProps) {
  const { assignments, createAssignment, deleteAssignment, isLoading } = useQuizzesStore();
  const { tasks } = useTasksStore();
  const { users } = useUsersStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<QuizAssignmentCreate>({
    assigned_to_user_id: undefined,
    task_id: undefined,
    required: false,
    due_at: undefined,
    max_attempts: undefined,
    cooldown_hours: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAssignment(quizId, formData);
      setIsModalOpen(false);
      setFormData({
        assigned_to_user_id: undefined,
        task_id: undefined,
        required: false,
        due_at: undefined,
        max_attempts: undefined,
        cooldown_hours: 0,
      });
    } catch (error) {
      // Ошибка уже в store
    }
  };

  const handleDelete = async (assignmentId: number) => {
    if (!confirm('Удалить назначение?')) return;
    try {
      await deleteAssignment(assignmentId);
    } catch (error) {
      // Ошибка уже в store
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsModalOpen(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Создать назначение
        </Button>
      </div>

      {assignments.length > 0 ? (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const assignedUser = users.find(u => u.id === assignment.assigned_to_user_id);
            const assignedTask = tasks.find(t => t.id === assignment.task_id);
            
            return (
              <Card key={assignment.id} className="p-6 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      {assignment.required && <Badge variant="danger">Обязательно</Badge>}
                      <span className="text-sm text-gray-500 dark:text-gray-400">ID: {assignment.id}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {assignedUser && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary-100 dark:bg-dark-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-dark-500 dark:text-dark-300">
                              {assignedUser.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{assignedUser.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">@{assignedUser.username}</p>
                          </div>
                        </div>
                      )}
                      {assignedTask && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 ml-10">
                          <svg className="w-4 h-4 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>Задача: {assignedTask.title}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t dark:border-gray-700">
                      {assignment.due_at && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Срок:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">{formatDate(assignment.due_at)}</span>
                        </div>
                      )}
                      {assignment.max_attempts && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Макс. попыток:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">{assignment.max_attempts}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Попыток использовано:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">{assignment.attempts_taken}</span>
                      </div>
                      {assignment.remaining_attempts !== null && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Осталось попыток:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">{assignment.remaining_attempts}</span>
                        </div>
                      )}
                      {assignment.cooldown_hours > 0 && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Пауза между попытками:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">{assignment.cooldown_hours} ч</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {assignment.attempts_taken > 0 && (
                      <Link to={`/assignment-attempts/${assignment.id}`}>
                        <Button variant="secondary" size="sm">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                          Попытки ({assignment.attempts_taken})
                        </Button>
                      </Link>
                    )}
                    <Button variant="danger" size="sm" onClick={() => handleDelete(assignment.id)}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Назначений пока нет. Создайте первое назначение.</p>
        </div>
      )}

      {/* Модальное окно */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Создать назначение теста"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 dark:border-blue-600 p-3 rounded mb-4">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              💡 Вы можете назначить тест либо пользователю напрямую, либо связать с задачей. 
              При привязке к задаче, тест автоматически назначится исполнителю задачи.
            </p>
          </div>

          <Select
            label="Пользователь"
            value={formData.assigned_to_user_id || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              assigned_to_user_id: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            options={[
              { value: '', label: 'Выберите пользователя' },
              ...users.map((user) => ({
                value: user.id,
                label: `${user.name} (@${user.username})`,
              })),
            ]}
          />

          <Select
            label="Или привязать к задаче"
            value={formData.task_id || ''}
            onChange={(e) => setFormData({ 
              ...formData, 
              task_id: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            options={[
              { value: '', label: 'Без привязки к задаче' },
              ...tasks.map((task) => ({
                value: task.id,
                label: `${task.title}`,
              })),
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Срок выполнения
            </label>
            <input
              type="datetime-local"
              value={formData.due_at || ''}
              onChange={(e) => setFormData({ ...formData, due_at: e.target.value || undefined })}
              className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="дд.мм.гггг --:--"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Максимум попыток
            </label>
            <input
              type="number"
              value={formData.max_attempts || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                max_attempts: e.target.value ? parseInt(e.target.value) : undefined 
              })}
              min={1}
              placeholder="Без ограничения"
              className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Оставьте пустым для неограниченного количества попыток</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Пауза между попытками (часы)
            </label>
            <input
              type="number"
              value={formData.cooldown_hours || 0}
              onChange={(e) => setFormData({ ...formData, cooldown_hours: parseInt(e.target.value) || 0 })}
              min={0}
              placeholder="0"
              className="input w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Время ожидания перед следующей попыткой (0 = без паузы)</p>
          </div>

          <label className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
            <input
              type="checkbox"
              checked={formData.required || false}
              onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
              className="w-4 h-4 text-primary-600 dark:text-primary-400 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:focus:ring-primary-400"
            />
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Обязательное прохождение</span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Тест помечается как обязательный к выполнению</p>
            </div>
          </label>

          <ModalFooter>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Создать
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}