import { useState } from 'react';
import { api } from '../api';

function CreateUser({ onClose, onCreated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('employee');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.createUser(username, password, name, role);
      onCreated();
    } catch (err) {
      setError(err.message || 'Ошибка создания пользователя');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Создать пользователя</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Имя пользователя</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={64}
              placeholder="Введите имя пользователя"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label>Полное имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={255}
              placeholder="Введите полное имя"
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              maxLength={128}
              placeholder="Введите пароль"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>Роль</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="employee">Сотрудник</option>
              <option value="manager">Менеджер</option>
            </select>
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

export default CreateUser;

