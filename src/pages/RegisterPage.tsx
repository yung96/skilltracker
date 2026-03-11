import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/entities/user/model/store';
import { Button, Input, Select } from '@/shared/ui';
import { ROUTES } from '@/shared/config/constants';
import type { UserRole } from '@/shared/api/types';

interface FormErrors {
  username?: string;
  password?: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('manager');
  
  // Состояния для валидации
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ username?: boolean; password?: boolean }>({});

  const validateField = (field: string, value: string): string | undefined => {
    if (field === 'username') {
      if (!value) return 'Имя пользователя обязательно';
      if (value.length < 3) return 'Имя пользователя должно содержать минимум 3 символа';
    }
    
    if (field === 'password') {
      if (!value) return 'Пароль обязателен';
      if (value.length < 9) return 'Пароль должен содержать минимум 9 символов';
    }
    
    return undefined;
  };

  const validateForm = (): boolean => {
    const usernameError = validateField('username', username);
    const passwordError = validateField('password', password);
    
    setErrors({
      username: usernameError,
      password: passwordError,
    });
    
    return !usernameError && !passwordError;
  };

  const isFormFilled = (): boolean => {
    return (
      username.trim() !== '' &&
      name.trim() !== '' &&
      password.trim() !== ''
    );
  };

  const canSubmit = (): boolean => {
    if (isLoading) return false;
    if (!isFormFilled()) return false;
    
    const usernameError = validateField('username', username);
    const passwordError = validateField('password', password);
    
    return !usernameError && !passwordError;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    
    if (touched.username) {
      const error = validateField('username', value);
      setErrors(prev => ({ ...prev, username: error }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (touched.password) {
      const error = validateField('password', value);
      setErrors(prev => ({ ...prev, password: error }));
    }
  };

  const handleBlur = (field: 'username' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (field === 'username') {
      const error = validateField('username', username);
      setErrors(prev => ({ ...prev, username: error }));
    } else {
      const error = validateField('password', password);
      setErrors(prev => ({ ...prev, password: error }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Отмечаем все поля как тронутые
    setTouched({ username: true, password: true });
    
    // Валидируем форму
    if (!validateForm()) {
      return;
    }
    
    try {
      await register({ username, name, password, role });
      navigate(ROUTES.DASHBOARD);
    } catch (error) {
      // Ошибка уже в store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 dark:bg-dark-500 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Регистрация</h1>
          <p className="text-gray-600 dark:text-gray-400">Создайте свой аккаунт</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-slide-up dark:border dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Имя пользователя"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              onBlur={() => handleBlur('username')}
              placeholder="username (минимум 3 символа)"
              required
              autoComplete="username"
              error={touched.username ? errors.username : undefined}
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
              onChange={handlePasswordChange}
              onBlur={() => handleBlur('password')}
              placeholder="минимум 9 символов"
              required
              autoComplete="new-password"
              error={touched.password ? errors.password : undefined}
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
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {/* Индикатор длины пароля */}
            {touched.password && password && password.length < 9 && (
              <div className="text-sm text-yellow-600 dark:text-yellow-400">
                Осталось символов: {password.length}/9
              </div>
            )}

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full"
              disabled={!canSubmit()}
            >
              Зарегистрироваться
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Уже есть аккаунт? <a href={ROUTES.LOGIN} className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium">Войти</a>
        </div>
      </div>
    </div>
  );
}