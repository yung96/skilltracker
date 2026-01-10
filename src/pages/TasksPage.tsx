import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTasksStore } from '@/entities/task/model/store';
import { useAuthStore } from '@/entities/user/model/store';
import { useUsersStore } from '@/entities/user/model/store';
import { Button, Loader } from '@/shared/ui';
import { TaskFilters } from '@/features/tasks/TaskFilters';
import { TaskCard } from '@/features/tasks/TaskCard';

export function TasksPage() {
  const { user } = useAuthStore();
  const { tasks, fetchTasks, isLoading } = useTasksStore();
  const { users, fetchUsers } = useUsersStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [employeeFilter, setEmployeeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    if (user?.role === 'manager') {
      fetchUsers();
    }
  }, [user?.role, fetchUsers]);

  useEffect(() => {
    const params: any = {};
    if (statusFilter) params.status = statusFilter;
    if (employeeFilter) params.employee_id = parseInt(employeeFilter);
    if (search) params.search = search;
    if (page > 1) {
      params.page = page;
      params.per_page = perPage;
    }
    fetchTasks(params);
  }, [search, statusFilter, employeeFilter, page, fetchTasks]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleEmployeeChange = (value: string) => {
    setEmployeeFilter(value);
    setPage(1);
  };

  if (isLoading && tasks.length === 0) {
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
          <h1 className="text-3xl font-bold text-gray-900">Задачи</h1>
          <p className="text-gray-600 mt-1">
            Управление задачами и проектами
          </p>
        </div>
        {user?.role === 'manager' && (
          <Link to="/tasks/new">
            <Button>
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Создать задачу
            </Button>
          </Link>
        )}
      </div>

      {/* Фильтры */}
      <TaskFilters
        search={search}
        statusFilter={statusFilter}
        employeeFilter={employeeFilter}
        tasks={tasks}
        users={users}
        isManager={user?.role === 'manager'}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onEmployeeChange={handleEmployeeChange}
      />

      {/* Список задач */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Задач не найдено</h3>
              <p className="text-gray-600">
                {search || statusFilter || employeeFilter
                  ? 'Попробуйте изменить параметры поиска'
                  : 'Создайте первую задачу'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {tasks.length === perPage && (
            <div className="flex justify-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Предыдущая
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => p + 1)}
              >
                Следующая
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
