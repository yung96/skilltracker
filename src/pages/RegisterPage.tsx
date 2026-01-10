import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/entities/user/model/store';
import { Button, Input, Select } from '@/shared/ui';
import { ROUTES } from '@/shared/config/constants';
import type { UserRole } from '@/shared/api/types';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('manager');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await register({ username, name, password, role });
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      // Ошибка уже в store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Регистрация</h1>
          <p className="text-gray-600">Создайте свой аккаунт</p>
        </div>

        <div className="card p-6 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Имя пользователя"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              required
              autoComplete="username"
            />

            <Input
              label="Полное имя"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Иван Иванов"
              required
              autoComplete="name"
            />

            <Input
              label="Пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />

            <Select
              label="Роль"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={[
                { value: 'manager', label: 'Менеджер' },
                { value: 'employee', label: 'Сотрудник' },
              ]}
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
            >
              Зарегистрироваться
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          Уже есть аккаунт? <a href={ROUTES.LOGIN} className="text-primary-500 hover:text-primary-600 font-medium">Войти</a>
        </div>
      </div>
    </div>
  );
}
