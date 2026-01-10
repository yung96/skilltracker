import { useMemo } from 'react';
import { Card, Input, Select } from '@/shared/ui';
import type { User, Task } from '@/shared/api/types';

interface TaskFiltersProps {
  search: string;
  statusFilter: string;
  employeeFilter: string;
  tasks: Task[];
  users: User[];
  isManager: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onEmployeeChange: (value: string) => void;
}

export function TaskFilters({
  search,
  statusFilter,
  employeeFilter,
  tasks,
  users,
  isManager,
  onSearchChange,
  onStatusChange,
  onEmployeeChange,
}: TaskFiltersProps) {
  const statusCounts = useMemo(() => {
    return {
      pending: tasks.filter((t) => t.status === 'pending').length,
      in_progress: tasks.filter((t) => t.status === 'in_progress').length,
      done: tasks.filter((t) => t.status === 'done').length,
    };
  }, [tasks]);

  const employeeOptions = useMemo(() => {
    return [
      { value: '', label: 'Все сотрудники' },
      ...users
        .filter((u) => u.role === 'employee')
        .map((u) => ({ value: String(u.id), label: u.name })),
    ];
  }, [users]);

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Поиск */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Поиск
          </label>
          <Input
            type="text"
            placeholder="Поиск по названию или описанию..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        {/* Фильтр по статусу */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Статус
          </label>
          <Select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            options={[
              { value: '', label: 'Все статусы' },
              { value: 'pending', label: `Ожидают (${statusCounts.pending})` },
              { value: 'in_progress', label: `В работе (${statusCounts.in_progress})` },
              { value: 'done', label: `Завершено (${statusCounts.done})` },
            ]}
          />
        </div>

        {/* Фильтр по сотруднику (только для менеджеров) */}
        {isManager && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Сотрудник
            </label>
            <Select
              value={employeeFilter}
              onChange={(e) => onEmployeeChange(e.target.value)}
              options={employeeOptions}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
