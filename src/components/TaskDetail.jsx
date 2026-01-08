import { useState, useEffect, useCallback } from 'react';
import { api } from '../api';

function TaskDetail({ task, user, onClose }) {
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [progress, setProgress] = useState(task.progress);
  const [status, setStatus] = useState(task.status);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadComments = useCallback(async () => {
    try {
      const data = await api.getComments(task.id);
      setComments(data);
    } catch (err) {
      console.error('Ошибка загрузки комментариев:', err);
    }
  }, [task.id]);

  const loadAttachments = useCallback(async () => {
    try {
      const data = await api.getAttachments(task.id);
      setAttachments(data);
    } catch (err) {
      console.error('Ошибка загрузки вложений:', err);
    }
  }, [task.id]);

  useEffect(() => {
    void loadComments();
    void loadAttachments();
  }, [loadComments, loadAttachments]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setLoading(true);
      await api.addComment(task.id, newComment);
      setNewComment('');
      await loadComments();
    } catch (err) {
      setError(err.message || 'Ошибка добавления комментария');
    } finally {
      setLoading(false);
    }
  };

  const canEditComment = (comment) => user.role === 'manager' || comment.user_id === user.id;

  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text || '');
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  const handleSaveComment = async (comment) => {
    try {
      setLoading(true);
      setError('');
      await api.updateComment(task.id, comment.id, editingCommentText);
      cancelEditComment();
      await loadComments();
    } catch (err) {
      setError(err.message || 'Ошибка обновления комментария');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (comment) => {
    if (!confirm('Удалить комментарий?')) return;
    try {
      setLoading(true);
      setError('');
      await api.deleteComment(task.id, comment.id);
      if (editingCommentId === comment.id) cancelEditComment();
      await loadComments();
    } catch (err) {
      setError(err.message || 'Ошибка удаления комментария');
    } finally {
      setLoading(false);
    }
  };

  const canDeleteAttachment = (attachment) =>
    user.role === 'manager' || attachment.uploaded_by_id === user.id;

  const handleDeleteAttachment = async (attachment) => {
    if (!confirm(`Удалить файл "${attachment.original_filename}"?`)) return;
    try {
      setLoading(true);
      setError('');
      await api.deleteAttachment(task.id, attachment.id);
      await loadAttachments();
    } catch (err) {
      setError(err.message || 'Ошибка удаления файла');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async () => {
    try {
      setLoading(true);
      setError('');
      await api.updateProgress(task.id, progress, status);
      alert('Прогресс обновлен');
    } catch (err) {
      setError(err.message || 'Ошибка обновления прогресса');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError('');
      await api.uploadAttachment(task.id, file);
      await loadAttachments();
      e.target.value = '';
    } catch (err) {
      setError(err.message || 'Ошибка загрузки файла');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return;

    try {
      setLoading(true);
      await api.deleteTask(task.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Ошибка удаления задачи');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusText = (statusValue) => {
    const statusMap = {
      pending: 'Ожидает',
      in_progress: 'В работе',
      done: 'Завершена',
    };
    return statusMap[statusValue] || statusValue;
  };

  return (

<div className="modal-overlay">
      <div className="modal">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
          <h2>{task.title}</h2>
          <button
            className="btn-cancel"
            onClick={onClose}
            style={{ padding: '5px 15px' }}
          >
            ✕
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div style={{ marginBottom: '20px' }}>
          <p style={{ color: '#666', marginBottom: '10px' }}>
            <strong>Исполнитель:</strong> {task.employee?.name || 'Не назначен'}
          </p>
          <p style={{ color: '#666', marginBottom: '10px' }}>
            <strong>Статус:</strong>{' '}
            <span className={`task-status ${task.status}`}>
              {getStatusText(task.status)}
            </span>
          </p>
          {task.description && (
            <p style={{ color: '#666', marginBottom: '10px' }}>
              <strong>Описание:</strong> {task.description}
            </p>
          )}
          {task.deadline && (
            <p style={{ color: '#666', marginBottom: '10px' }}>
              <strong>Срок выполнения:</strong> {formatDate(task.deadline)}
            </p>
          )}
          <p style={{ color: '#999', fontSize: '0.9rem', marginTop: '10px' }}>
            Создана: {formatDate(task.created_at)}
          </p>
        </div>

        {/* Обновление прогресса (для сотрудника или менеджера) */}
        {(user.id === task.employee_id || user.role === 'manager') && (
          <div style={{ marginBottom: '30px', padding: '20px', background: '#f9f9f9', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '15px' }}>Обновить прогресс</h3>
            <div className="form-group">
              <label>Прогресс: {progress}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
            <div className="form-group">
              <label>Статус</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">Ожидает</option>
                <option value="in_progress">В работе</option>
                <option value="done">Завершена</option>
              </select>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleUpdateProgress}
              disabled={loading}
              style={{ width: 'auto', padding: '10px 20px' }}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        )}

        {/* Комментарии */}
        <div className="comments-section">
          <h3>Комментарии ({comments.length})</h3>

          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">
                    {comment.author?.name || 'Неизвестный'}
                  </span>
                  <span className="comment-date">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                {editingCommentId === comment.id ? (
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={editingCommentText}
                      onChange={(e) => setEditingCommentText(e.target.value)}
                      disabled={loading}
                      style={{ flex: 1 }}
                    />
                    <button
                      className="btn btn-primary"
                      style={{ width: 'auto', padding: '8px 12px' }}
                      onClick={() => handleSaveComment(comment)}
                      disabled={loading || !editingCommentText.trim()}
                      type="button"
                    >
                      💾
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ width: 'auto', padding: '8px 12px' }}
                      onClick={cancelEditComment}
                      disabled={loading}
                      type="button"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                    <div className="comment-text" style={{ flex: 1 }}>{comment.text}</div>
                    {canEditComment(comment) && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ width: 'auto', padding: '6px 10px' }}
                          onClick={() => startEditComment(comment)}
                          disabled={loading}
                          type="button"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-cancel"
                          style={{ width: 'auto', padding: '6px 10px', background: '#ff4757', color: 'white' }}
                          onClick={() => handleDeleteComment(comment)}
                          disabled={loading}
                          type="button"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment}>
            <div className="form-group">
              <label>Добавить комментарий</label>
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Введите комментарий..."
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !newComment.trim()}
              style={{ width: 'auto', padding: '10px 20px' }}
            >
              Отправить
            </button>
          </form>
        </div>

        {/* Вложения */}
        <div className="attachments-section">
          <h3>Вложения ({attachments.length})</h3>

          {attachments.length > 0 && (
            <div className="attachments-list">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="attachment-item">
                  <div className="attachment-icon">📎</div>
                  <div className="attachment-info">
                    <div className="attachment-name">
                      {attachment.original_filename}
                    </div>
                    <div className="attachment-meta">
                      {formatDate(attachment.created_at)}
                    </div>
                  </div>
                  {canDeleteAttachment(attachment) && (
                    <button
                      className="btn-cancel"
                      style={{ width: 'auto', padding: '6px 10px', background: '#ff4757', color: 'white' }}
                      onClick={() => handleDeleteAttachment(attachment)}
                      disabled={loading}
                      type="button"
                      title="Удалить файл"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="file-input">
            <label
              htmlFor="file-upload"
              className="btn btn-primary"
              style={{ width: 'auto', padding: '10px 20px', display: 'inline-block' }}
            >
              📤 Загрузить файл
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              disabled={loading}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* Действия */}
        {user.role === 'manager' && (
          <div className="modal-actions" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #f0f0f0' }}>
            <button
              className="btn-cancel"
              onClick={handleDelete}
              disabled={loading}
              style={{ background: '#ff4757', color: 'white' }}
            >
              Удалить задачу
            </button>
            <button className="btn-cancel" onClick={onClose}>
              Закрыть
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskDetail;

