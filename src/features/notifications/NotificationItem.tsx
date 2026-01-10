import { useNavigate } from 'react-router-dom';
import { Notification } from '@/shared/api';
import { cn } from '@/shared/lib/utils';
import { ROUTES } from '@/shared/config/constants';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onClose: () => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
  onClose,
}: NotificationItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (notification.payload) {
      const { type, payload } = notification;

      if (type === 'task_assigned' || type === 'task_progress_updated' || type === 'comment_added' || type === 'attachment_added') {
        if (payload.task_id) {
          navigate(`${ROUTES.TASKS}/${payload.task_id}`);
          onClose();
        }
      } else if (type === 'quiz_assigned') {
        if (payload.assignment_id) {
          navigate(ROUTES.MY_ASSIGNMENTS);
          onClose();
        }
      } else if (type === 'attempt_completed') {
        if (payload.attempt_id) {
          navigate(`/attempts/${payload.attempt_id}/result`);
          onClose();
        }
      }
    }
  };

  const getIcon = () => {
    const { type } = notification;

    if (type === 'task_assigned') {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    }

    if (type === 'quiz_assigned') {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }

    if (type === 'attempt_completed') {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    if (type === 'comment_added') {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      );
    }

    if (type === 'attachment_added') {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      );
    }

    if (type === 'task_progress_updated') {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    }

    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    if (diffDays < 7) return `${diffDays} дн. назад`;
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full p-4 text-left hover:bg-gray-50 transition-colors',
        !notification.is_read && 'bg-primary-50/50'
      )}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
            notification.is_read ? 'bg-gray-100 text-gray-600' : 'bg-primary-100 text-primary-600'
          )}
        >
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium text-gray-900', !notification.is_read && 'font-semibold')}>
            {notification.title}
          </p>
          {notification.body && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {notification.body}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(notification.created_at)}
          </p>
        </div>

        {/* Unread indicator */}
        {!notification.is_read && (
          <div className="flex-shrink-0">
            <div className="w-2 h-2 bg-primary-500 rounded-full" />
          </div>
        )}
      </div>
    </button>
  );
}
