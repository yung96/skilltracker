import { useState, useEffect } from 'react';
import { api } from '../api';
import TaskDetail from './TaskDetail';
import CreateTask from './CreateTask';

function TaskList({ user }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки задач');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleCloseDetail = () => {
    setSelectedTask(null);
    loadTasks();
  };

  const handleTaskCreated = () => {
    setShowCreateModal(false);
    loadTasks();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указан';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Ожидает',
      in_progress: 'В работе',
      done: 'Завершена',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Загрузка задач...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Задачи</h2>
          {user.role === 'manager' && (
            <button
              className="btn btn-primary"
              style={{ width: 'auto', padding: '10px 20px' }}
              onClick={() => setShowCreateModal(true)}
            >
              + Создать задачу
            </button>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>Нет задач</h3>
            <p>
              {user.role === 'manager'
                ? 'Создайте первую задачу для сотрудников'
                : 'У вас пока нет назначенных задач'}
            </p>
          </div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`task-item status-${task.status}`}
                onClick={() => handleTaskClick(task)}
              >
                <div className="task-header">
                  <div>
                    <div className="task-title">{task.title}</div>
                    {task.employee && (
                      <div className="task-employee">
                        Исполнитель: {task.employee.name}
                      </div>
                    )}
                  </div>
                  <span className={`task-status ${task.status}`}>
                    {getStatusText(task.status)}
                  </span>
                </div>

                {task.description && (
                  <div className="task-description">{task.description}</div>
                )}

                <div className="task-progress">
                  <div className="progress-label">
                    <span>Прогресс</span>
                    <span>{task.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="task-meta">
                  <span>Создана: {formatDate(task.created_at)}</span>
                  {task.deadline && (
                    <span>Срок: {formatDate(task.deadline)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          user={user}
          onClose={handleCloseDetail}
        />
      )}

      {showCreateModal && (
        <CreateTask
          onClose={() => setShowCreateModal(false)}
          onCreated={handleTaskCreated}
        />
      )}
    </>
  );
}

export default TaskList;

