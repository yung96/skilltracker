import { useRef } from 'react';
import { useAuthStore } from '@/entities/user/model/store';
import { Button } from '@/shared/ui';
import { formatDate } from '@/shared/lib/utils';
import type { Attachment } from '@/shared/api/types';

interface TaskAttachmentsProps {
  taskId: number;
  attachments: Attachment[];
  onUpload: (taskId: number, file: File) => Promise<void>;
  onDelete: (taskId: number, attachmentId: number) => Promise<void>;
  canEdit: boolean;
}

export function TaskAttachments({ taskId, attachments, onUpload, onDelete, canEdit }: TaskAttachmentsProps) {
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isManager = user?.role === 'manager';

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await onUpload(taskId, file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      // Ошибка уже в store
    }
  };

  const handleDelete = async (attachmentId: number) => {
    if (!confirm('Удалить вложение?')) return;
    try {
      await onDelete(taskId, attachmentId);
    } catch (error) {
      // Ошибка уже в store
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Вложения</h2>
        {canEdit && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Загрузить файл
            </Button>
          </>
        )}
      </div>

      {attachments.length > 0 ? (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.original_filename}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(attachment.created_at)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={attachment.stored_path}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" size="sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </Button>
                </a>
                {(isManager || attachment.uploaded_by_id === user?.id) && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(attachment.id)}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">Вложений пока нет</p>
      )}
    </div>
  );
}
