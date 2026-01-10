import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/entities/user/model/store';
import { useTasksStore } from '@/entities/task/model/store';
import { useQuizzesStore } from '@/entities/quiz/model/store';
import { Card, CardContent, Badge, Loader } from '@/shared/ui';
import { ROUTES } from '@/shared/config/constants';
import { formatDate } from '@/shared/lib/utils';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks, isLoading: tasksLoading } = useTasksStore();
  const { myAssignments, fetchMyAssignments, isLoading: quizzesLoading } = useQuizzesStore();

  const getTaskStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'in_progress':
        return 'В работе';
      case 'done':
        return 'Выполнено';
      default:
        return status;
    }
  };

  const getTaskStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'in_progress':
        return 'in-progress';
      case 'done':
        return 'done';
      default:
        return 'default';
    }
  };

  useEffect(() => {
    fetchTasks();
    if (user?.role === 'employee') {
      fetchMyAssignments();
    }
  }, [fetchTasks, fetchMyAssignments, user?.role]);

  const stats = {
    totalTasks: tasks.length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'done').length,
    pending: tasks.filter(t => t.status === 'pending').length,
  };

  if (tasksLoading || quizzesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Приветствие */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Добро пожаловать, {user?.name}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          {user?.role === 'manager' ? 'Вы управляете проектами' : 'Ваши текущие задачи'}
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Всего задач</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTasks}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">В работе</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Завершено</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Ожидают</p>
              <p className="text-3xl font-bold text-gray-600 mt-1">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Последние задачи */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Последние задачи</h2>
          <Link to={ROUTES.TASKS} className="text-primary-500 hover:text-primary-600 text-sm font-medium">
            Посмотреть все →
          </Link>
        </div>
        <div className="space-y-6">
          {tasks.slice(0, 5).map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`} className="block">
              <Card hover className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                      {task.employee && (
                        <span>{task.employee.name}</span>
                      )}
                      {task.deadline && (
                        <span>•  {formatDate(task.deadline)}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant={getTaskStatusVariant(task.status)}>
                    {getTaskStatusLabel(task.status)}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Пока нет задач
            </div>
          )}
        </div>
      </div>

      {/* Мои назначенные тесты (для сотрудников) */}
      {user?.role === 'employee' && myAssignments.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Назначенные тесты</h2>
            <Link to={ROUTES.MY_ASSIGNMENTS} className="text-primary-500 hover:text-primary-600 text-sm font-medium">
              Посмотреть все →
            </Link>
          </div>
          <div className="space-y-6">
            {myAssignments.slice(0, 3).map((item) => (
              <Card key={item.assignment.id} hover className="p-4">
                <CardContent>
                  <h3 className="font-medium text-gray-900">{item.quiz.title}</h3>
                  {item.quiz.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.quiz.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>Попыток: {item.assignment.attempts_taken}</span>
                    {item.assignment.remaining_attempts !== null && (
                      <span>• Осталось: {item.assignment.remaining_attempts}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
