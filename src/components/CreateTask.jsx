import { useState, useEffect } from 'react';
import { api } from '../api';

function CreateTask({ onClose, onCreated }) {
  const [users, setUsers] = useState([]);
  const [employeeId, setEmployeeId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [status, setStatus] = useState('pending');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      // Фильтруем только сотрудников
      const employees = data.filter(u => u.role === 'employee');
      setUsers(employees);
      if (employees.length > 0) {
        setEmployeeId(employees[0].id.toString());
      }
    } catch (err) {
      setError('Ошибка загрузки пользователей');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createTask(
        parseInt(employeeId),
        title,
        description || null,
        deadline || null,
        status,
        progress
      );
      onCreated();
    } catch (err) {
      setError(err.message || 'Ошибка создания задачи');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Создать задачу</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Исполнитель</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            >
              <option value="">Выберите исполнителя</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.username})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Название задачи</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={255}
              placeholder="Введите название задачи"
            />
          </div>

          <div className="form-group">
            <label>Описание (необязательно)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Введите описание задачи"
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />
          </div>

          <div className="form-group">
            <label>Срок выполнения (необязательно)</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
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

          <div className="modal-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: 'auto', padding: '10px 20px' }}
            >
              {loading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTask;

