import { Link } from 'react-router-dom';
import { Card, Badge } from '@/shared/ui';
import { formatDate } from '@/shared/lib/utils';
import type { Task } from '@/shared/api/types';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const getStatusLabel = (status: string) => {
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

  const getStatusVariant = (status: string) => {
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

  return (
    <Link to={`/tasks/${task.id}`} className="block h-full">
      <Card hover className="p-6 h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <Badge variant={getStatusVariant(task.status)}>
            {getStatusLabel(task.status)}
          </Badge>
          <span className="text-sm font-medium text-primary-600">
            {task.progress}%
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem] leading-snug">
          {task.title}
        </h3>

        <div className="mb-3 min-h-[2.5rem]">
          {task.description ? (
            <p className="text-sm text-gray-600 line-clamp-2">
              {task.description}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 text-sm text-gray-500 mb-4">
          {task.employee && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{task.employee.name}</span>
            </div>
          )}
          {task.deadline && (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{formatDate(task.deadline)}</span>
            </div>
          )}
        </div>

        {/* Прогресс бар */}
        <div className="mt-auto">
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300 rounded-full"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}
