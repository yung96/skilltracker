import { useState, useEffect } from 'react';
import { api } from './api';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('login'); // 'login', 'register', 'dashboard'

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
      setView('dashboard');
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (username, password) => {
    const data = await api.login(username, password);
    setUser(data.user);
    setView('dashboard');
  };

  const handleRegister = async (username, password, name, role) => {
    await api.register(username, password, name, role);
    await handleLogin(username, password);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      setView('login');
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="app">
      {view === 'login' && (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => setView('register')}
        />
      )}
      {view === 'register' && (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() => setView('login')}
        />
      )}
      {view === 'dashboard' && user && (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
