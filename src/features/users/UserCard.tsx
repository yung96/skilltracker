import { Card, Avatar, Badge, Button } from '@/shared/ui';
import { formatDate } from '@/shared/lib/utils';
import type { User } from '@/shared/api/types';

interface UserCardProps {
  user: User;
  onDelete: (id: number) => void;
}

export function UserCard({ user, onDelete }: UserCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <Avatar name={user.name} size="lg" />
        <Badge variant={user.role === 'manager' ? 'primary' : 'default'}>
          {user.role === 'manager' ? 'Менеджер' : 'Сотрудник'}
        </Badge>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        {user.name}
      </h3>
      <p className="text-sm text-gray-600 mb-4">@{user.username}</p>

      <div className="text-xs text-gray-500 mb-4">
        Создан: {formatDate(user.created_at)}
      </div>

      <div className="flex gap-2">
        <Button
          variant="danger"
          size="sm"
          className="w-full"
          onClick={() => onDelete(user.id)}
        >
          Удалить
        </Button>
      </div>
    </Card>
  );
}
