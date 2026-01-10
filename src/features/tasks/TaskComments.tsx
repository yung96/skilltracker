import { useState } from 'react';
import { useAuthStore } from '@/entities/user/model/store';
import { Textarea, Button } from '@/shared/ui';
import { formatDate } from '@/shared/lib/utils';
import type { Comment } from '@/shared/api/types';

interface TaskCommentsProps {
  taskId: number;
  comments: Comment[];
  onAdd: (taskId: number, text: string) => Promise<void>;
  onUpdate: (taskId: number, commentId: number, text: string) => Promise<void>;
  onDelete: (taskId: number, commentId: number) => Promise<void>;
  isLoading: boolean;
  canEdit: boolean;
}

export function TaskComments({ taskId, comments, onAdd, onUpdate, onDelete, isLoading, canEdit }: TaskCommentsProps) {
  const { user } = useAuthStore();
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const isManager = user?.role === 'manager';

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await onAdd(taskId, commentText);
      setCommentText('');
    } catch (error) {
      // Ошибка уже в store
    }
  };

  const handleEdit = async (commentId: number) => {
    if (!editingCommentText.trim()) return;

    try {
      await onUpdate(taskId, commentId, editingCommentText);
      setEditingCommentId(null);
      setEditingCommentText('');
    } catch (error) {
      // Ошибка уже в store
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('Удалить комментарий?')) return;
    try {
      await onDelete(taskId, commentId);
    } catch (error) {
      // Ошибка уже в store
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Комментарии</h2>

      {/* Форма добавления */}
      {canEdit && (
        <form onSubmit={handleAdd} className="mb-6">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Добавить комментарий..."
            rows={3}
            className="mb-2"
          />
          <Button type="submit" size="sm" disabled={!commentText.trim() || isLoading}>
            Отправить
          </Button>
        </form>
      )}

      {/* Список комментариев */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-l-4 border-primary-200 pl-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {comment.author?.name || 'Неизвестный пользователь'}
                  </p>
                  <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                </div>
                {(isManager || comment.user_id === user?.id) && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditingCommentText(comment.text);
                      }}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
              {editingCommentId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editingCommentText}
                    onChange={(e) => setEditingCommentText(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(comment.id)}
                      disabled={!editingCommentText.trim() || isLoading}
                    >
                      Сохранить
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditingCommentId(null);
                        setEditingCommentText('');
                      }}
                    >
                      Отмена
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">Комментариев пока нет</p>
      )}
    </div>
  );
}
