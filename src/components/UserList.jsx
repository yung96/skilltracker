import { useState, useEffect } from 'react';
import { api } from '../api';
import CreateUser from './CreateUser';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', name: '', role: 'employee', password: '' });
  const [saving, setSaving] = useState(false);

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

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      username: user.username || '',
      name: user.name || '',
      role: user.role || 'employee',
      password: '',
    });
  };

  const closeEdit = () => {
    setEditingUser(null);
    setEditForm({ username: '', name: '', role: 'employee', password: '' });
    setSaving(false);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      setSaving(true);
      setError('');

      const payload = {
        username: editForm.username,
        name: editForm.name,
        role: editForm.role,
      };
      if (editForm.password && editForm.password.trim()) {
        payload.password = editForm.password;
      }

      await api.updateUser(editingUser.id, payload);
      closeEdit();
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Ошибка сохранения пользователя');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!confirm(`Удалить пользователя ${user.name} (@${user.username})?`)) return;
    try {
      setSaving(true);
      setError('');
      await api.deleteUser(user.id);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Ошибка удаления пользователя');
    } finally {
      setSaving(false);
    }
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
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className="user-badge">{getRoleText(user.role)}</span>
                  <button
                    className="btn btn-secondary"
                    style={{ width: 'auto', padding: '8px 12px' }}
                    onClick={() => openEdit(user)}
                    disabled={saving}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-cancel"
                    style={{ width: 'auto', padding: '8px 12px', background: '#ff4757', color: 'white' }}
                    onClick={() => handleDeleteUser(user)}
                    disabled={saving}
                  >
                    🗑️
                  </button>
                </div>
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

      {editingUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <h2>Редактировать пользователя</h2>
              <button className="btn-cancel" onClick={closeEdit} style={{ padding: '5px 15px' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label>Логин</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label>Имя</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label>Роль</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  disabled={saving}
                >
                  <option value="employee">Сотрудник</option>
                  <option value="manager">Менеджер</option>
                </select>
              </div>

              <div className="form-group">
                <label>Новый пароль (необязательно)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  disabled={saving}
                />
              </div>

              <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={closeEdit} disabled={saving}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default UserList;

