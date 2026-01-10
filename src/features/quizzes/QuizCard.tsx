import { Link } from 'react-router-dom';
import { Card, Badge, Button } from '@/shared/ui';
import { formatDate } from '@/shared/lib/utils';
import type { Quiz } from '@/shared/api/types';

interface QuizCardProps {
  quiz: Quiz;
  onDelete: (id: number) => void;
}

export function QuizCard({ quiz, onDelete }: QuizCardProps) {
  return (
    <Card hover className="p-6">
      <div className="flex items-start justify-between mb-4">
        <Badge variant={quiz.status === 'published' ? 'success' : 'warning'}>
          {quiz.status === 'published' ? 'Опубликован' : 'Черновик'}
        </Badge>
        <span className="text-sm font-medium text-primary-600">
          {quiz.pass_percent}% для прохождения
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {quiz.title}
      </h3>

      {quiz.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {quiz.description}
        </p>
      )}

      <div className="space-y-2 text-sm text-gray-500 mb-4">
        {quiz.time_limit_seconds && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Ограничение: {Math.floor(quiz.time_limit_seconds / 60)} мин.</span>
          </div>
        )}
        {quiz.max_attempts && (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Попыток: {quiz.max_attempts}</span>
          </div>
        )}
        <div className="text-xs text-gray-400">
          Создан: {formatDate(quiz.created_at)}
        </div>
      </div>

      <div className="flex gap-2">
        <Link to={`/quizzes/${quiz.id}`} className="flex-1">
          <Button variant="secondary" size="sm" className="w-full">
            Открыть
          </Button>
        </Link>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(quiz.id)}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </div>
    </Card>
  );
}
