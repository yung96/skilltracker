import { Card } from '@/shared/ui';
import type { QuizAnalytics as QuizAnalyticsType } from '@/shared/api/types';

interface QuizAnalyticsProps {
  analytics: QuizAnalyticsType | null;
}

export function QuizAnalytics({ analytics }: QuizAnalyticsProps) {
  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Загрузка аналитики...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-6">
        <p className="text-sm text-gray-500 mb-1">Всего назначений</p>
        <p className="text-3xl font-bold text-gray-900">{analytics.total_assignments}</p>
      </Card>
      
      <Card className="p-6">
        <p className="text-sm text-gray-500 mb-1">Всего попыток</p>
        <p className="text-3xl font-bold text-gray-900">{analytics.total_attempts}</p>
      </Card>
      
      <Card className="p-6">
        <p className="text-sm text-gray-500 mb-1">Завершено</p>
        <p className="text-3xl font-bold text-gray-900">{analytics.completed_attempts}</p>
      </Card>
      
      <Card className="p-6">
        <p className="text-sm text-gray-500 mb-1">Процент сдачи</p>
        <p className="text-3xl font-bold text-green-600">{analytics.pass_rate.toFixed(1)}%</p>
      </Card>
    </div>
  );
}
