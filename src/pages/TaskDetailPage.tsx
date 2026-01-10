import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTasksStore } from '@/entities/task/model/store';
import { useAuthStore } from '@/entities/user/model/store';
import { Card, Badge, Button, Loader, Modal, ModalFooter } from '@/shared/ui';
import { formatDate } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/config/constants';
import { TaskComments } from '@/features/tasks/TaskComments';
import { TaskAttachments } from '@/features/tasks/TaskAttachments';
import { TaskProgressUpdate } from '@/features/tasks/TaskProgressUpdate';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    selectedTask, 
    comments, 
    attachments,
    fetchTask, 
    updateProgress,
    deleteTask,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
    fetchAttachments,
    uploadAttachment,
    deleteAttachment,
    isLoading 
  } = useTasksStore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const taskId = parseInt(id || '0');
  const isManager = user?.role === 'manager';
  const canEdit = isManager || selectedTask?.employee_id === user?.id;

  useEffect(() => {
    if (taskId) {
      fetchTask(taskId);
      fetchComments(taskId);
      fetchAttachments(taskId);
    }
  }, [taskId, fetchTask, fetchComments, fetchAttachments]);

  const handleDeleteTask = async () => {
    if (!taskId) return;
    try {
      await deleteTask(taskId);
      navigate(ROUTES.TASKS);
    } catch (error) {
      // Ошибка уже в store
    }
  };

  if (isLoading && !selectedTask) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (!selectedTask) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-1">Задача не найдена</h3>
        <Link to={ROUTES.TASKS}>
          <Button variant="secondary">Вернуться к задачам</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={ROUTES.TASKS}>
            <Button variant="secondary" size="sm">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Назад
            </Button>
          </Link>
          <Badge variant={selectedTask.status}>
            {selectedTask.status === 'pending' && 'Ожидает'}
            {selectedTask.status === 'in_progress' && 'В работе'}
            {selectedTask.status === 'done' && 'Выполнено'}
          </Badge>
        </div>
        {isManager && (
          <Button variant="danger" size="sm" onClick={() => setIsDeleteModalOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Удалить задачу
          </Button>
        )}
      </div>

      {/* Основная информация */}
      <Card className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedTask.title}</h1>
        
        {selectedTask.description && (
          <p className="text-gray-700 mb-6 whitespace-pre-wrap">{selectedTask.description}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {selectedTask.employee && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Исполнитель</h3>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">
                    {selectedTask.employee.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedTask.employee.name}</p>
                  <p className="text-sm text-gray-500">@{selectedTask.employee.username}</p>
                </div>
              </div>
            </div>
          )}

          {selectedTask.deadline && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Срок выполнения</h3>
              <p className="text-gray-900">{formatDate(selectedTask.deadline)}</p>
            </div>
          )}
        </div>

        {/* Прогресс */}
        {canEdit && (
          <TaskProgressUpdate
            task={selectedTask}
            onUpdate={updateProgress}
            isLoading={isLoading}
          />
        )}
      </Card>

      {/* Вложения */}
      <Card className="p-6">
        <TaskAttachments
          taskId={taskId}
          attachments={attachments}
          onUpload={uploadAttachment}
          onDelete={deleteAttachment}
          canEdit={canEdit}
        />
      </Card>

      {/* Комментарии */}
      <Card className="p-6">
        <TaskComments
          taskId={taskId}
          comments={comments}
          onAdd={addComment}
          onUpdate={updateComment}
          onDelete={deleteComment}
          isLoading={isLoading}
          canEdit={canEdit}
        />
      </Card>

      {/* Модальное окно удаления */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Удалить задачу"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Вы уверены, что хотите удалить эту задачу? Это действие нельзя отменить.
          </p>

          <ModalFooter>
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>
              Отмена
            </Button>
            <Button variant="danger" onClick={handleDeleteTask} isLoading={isLoading}>
              Удалить
            </Button>
          </ModalFooter>
        </div>
      </Modal>
    </div>
  );
}
