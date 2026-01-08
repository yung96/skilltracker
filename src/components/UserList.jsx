import { useState, useEffect } from 'react';
import { api } from '../api';
import CreateUser from './CreateUser';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleUserCreated = () => {
    setShowCreateModal(false);
    loadUsers();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleText = (role) => {
    return role === 'manager' ? 'Менеджер' : 'Сотрудник';
  };

  if (loading) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Загрузка пользователей...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Пользователи</h2>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '10px 20px' }}
            onClick={() => setShowCreateModal(true)}
          >
            + Создать пользователя
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>Нет пользователей</h3>
            <p>Создайте первого пользователя</p>
          </div>
        ) : (
          <div className="user-list">
            {users.map((user) => (
              <div key={user.id} className="user-item">
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p>
                    @{user.username} • {getRoleText(user.role)} • Создан:{' '}
                    {formatDate(user.created_at)}
                  </p>
                </div>
                <span className="user-badge">{getRoleText(user.role)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateUser
          onClose={() => setShowCreateModal(false)}
          onCreated={handleUserCreated}
        />
      )}
    </>
  );
}

export default UserList;

