import { Card } from '@/shared/ui';
import { formatDate } from '@/shared/lib/utils';
import type { AssignmentDetail } from '@/shared/api/types';

interface AssignmentInfoProps {
  assignmentDetail: AssignmentDetail;
}

export function AssignmentInfo({ assignmentDetail }: AssignmentInfoProps) {
  const remaining = assignmentDetail.assignment.remaining_attempts;
  const hasRemaining = remaining !== null && remaining !== undefined;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация о назначении</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignmentDetail.assigned_user && (
          <div>
            <p className="text-sm text-gray-500">Назначен</p>
            <p className="font-medium text-gray-900">{assignmentDetail.assigned_user.name}</p>
          </div>
        )}
        {assignmentDetail.task && (
          <div>
            <p className="text-sm text-gray-500">Задача</p>
            <p className="font-medium text-gray-900">{assignmentDetail.task.title}</p>
          </div>
        )}
        {assignmentDetail.assignment.due_at && (
          <div>
            <p className="text-sm text-gray-500">Срок выполнения</p>
            <p className="font-medium text-gray-900">{formatDate(assignmentDetail.assignment.due_at)}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-gray-500">Попыток использовано</p>
          <p className="font-medium text-gray-900">
            {assignmentDetail.assignment.attempts_taken}
            {hasRemaining &&
              ` / ${assignmentDetail.assignment.attempts_taken + remaining}`}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Обязательный</p>
          <p className="font-medium text-gray-900">
            {assignmentDetail.assignment.required ? 'Да' : 'Нет'}
          </p>
        </div>
      </div>
    </Card>
  );
}
