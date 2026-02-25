import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '@/shared/ui';
import { formatDate } from '@/shared/lib/utils';
import type { AttemptListItem } from '@/shared/api/types';

interface AttemptCardProps {
  attempt: AttemptListItem;
}

export function AttemptCard({ attempt }: AttemptCardProps) {
  const getStatusLabel = () => {
    if (attempt.status === 'completed') {
      return attempt.passed ? 'Пройден' : 'Не пройден';
    }
    if (attempt.status === 'in_progress') {
      return 'В процессе';
    }
    if (attempt.status === 'expired') {
      return 'Истёк срок';
    }
    return attempt.status;
  };

  const getStatusVariant = () => {
    if (attempt.passed) return 'success';
    if (attempt.passed === false) return 'danger';
    return 'warning';
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant={getStatusVariant()}>
              {getStatusLabel()}
            </Badge>
            {attempt.score_percent !== null && attempt.score_percent !== undefined && (
              <span className="text-2xl font-bold text-gray-900">
                {attempt.score_percent.toFixed(1)}%
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Пользователь:</span>
              <span className="ml-2 font-medium">{attempt.user_name}</span>
            </div>
            <div>
              <span className="text-gray-500">Начато:</span>
              <span className="ml-2 font-medium">{formatDate(attempt.started_at)}</span>
            </div>
            {attempt.finished_at && (
              <div>
                <span className="text-gray-500">Завершено:</span>
                <span className="ml-2 font-medium">{formatDate(attempt.finished_at)}</span>
              </div>
            )}
          </div>
        </div>

        {attempt.status === 'completed' && (
          <Link to={`/attempt-result/${attempt.id}`}>
            <Button variant="secondary" size="sm">
              Посмотреть детали
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
}
