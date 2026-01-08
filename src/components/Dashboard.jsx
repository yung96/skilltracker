import { useState } from 'react';
import TaskList from './TaskList';
import UserList from './UserList';

function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('tasks');

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-left">
          <h1>
            Система управления задачами
            <span className="user-badge">
              {user.role === 'manager' ? 'Менеджер' : 'Сотрудник'}
            </span>
          </h1>
          <p>Добро пожаловать, {user.name}!</p>
        </div>
        <div className="header-right">
          <button className="btn-small btn-logout" onClick={onLogout}>
            Выход
          </button>
        </div>
      </header>

      <div className="content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Задачи
          </button>
          {user.role === 'manager' && (
            <button
              className={`tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Пользователи
            </button>
          )}
        </div>

        {activeTab === 'tasks' && <TaskList user={user} />}
        {activeTab === 'users' && user.role === 'manager' && (
          <UserList />
        )}
      </div>
    </div>
  );
}

export default Dashboard;

