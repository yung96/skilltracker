import { useState, FormEvent } from 'react';
import { Sparkles, Bot, CheckCircle } from 'lucide-react';
import { Modal, ModalFooter, Button } from '@/shared/ui';
import { quizzesApi } from '@/shared/api/quizzes';

interface QuizAIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuizAIGenerateModal({ isOpen, onClose }: QuizAIGenerateModalProps) {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (isLoading) return;
    setTopic('');
    setIsDone(false);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      await quizzesApi.generateWithAI(topic.trim());
      setIsDone(true);
    } catch {
      setError('Не удалось запустить генерацию. Проверьте соединение и попробуйте снова.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isDone ? 'Генерация запущена' : 'Сгенерировать тест с AI'}
      size="md"
    >
      {isDone ? (
        <div className="py-4 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-base font-medium text-gray-900 dark:text-white">
              Тест по теме «{topic}» генерируется
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Когда тест будет готов, вы получите уведомление. Обычно это занимает несколько секунд.
            </p>
          </div>
          <ModalFooter className="w-full border-none py-0 px-0">
            <Button onClick={handleClose} className="w-full">
              Понятно
            </Button>
          </ModalFooter>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Описание */}
          <div className="flex gap-3 p-3 rounded-xl bg-dark-900/10 dark:bg-dark-400/10 border border-dark-200/30 dark:border-dark-400/20">
            <div className="flex-shrink-0 mt-0.5">
              <Bot className="w-5 h-5 text-dark-500 dark:text-dark-300" />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              AI сгенерирует тест с 8 вопросами по указанной теме и сразу опубликует его. Когда тест будет готов — вы получите уведомление.
            </p>
          </div>

          {/* Поле темы */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Тема теста
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Например: Python asyncio, SQL JOIN, основы Git..."
              required
              autoFocus
              disabled={isLoading}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         placeholder-gray-400 dark:placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-dark-500 focus:border-transparent
                         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 px-1">{error}</p>
          )}

          <ModalFooter>
            <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
              Отмена
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              disabled={!topic.trim()}
              className="gap-2"
            >
              {!isLoading && <Sparkles className="w-4 h-4" />}
              Сгенерировать
            </Button>
          </ModalFooter>
        </form>
      )}
    </Modal>
  );
}
