import { useState } from 'react';
import { Modal, ModalFooter, Input, Select, Button } from '@/shared/ui';
import type { UserCreate, UserRole } from '@/shared/api/types';

interface UserCreateModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onCreate: (data: UserCreate) => Promise<void>;
}

interface FormErrors {
  username?: string;
  password?: string;
}

export function UserCreateModal({
  isOpen,
  isLoading,
  onClose,
  onCreate,
}: UserCreateModalProps) {
  const [formData, setFormData] = useState<UserCreate>({
    username: '',
    name: '',
    password: '',
    role: 'employee',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ username?: boolean; password?: boolean }>({});

  const validateField = (field: string, value: string): string | undefined => {
    if (field === 'username') {
      if (!value) return 'Имя пользователя обязательно';
      if (value.length <= 3) return 'Имя пользователя должно быть длиннее 3 символов';
    }
    
    if (field === 'password') {
      if (!value) return 'Пароль обязателен';
      if (value.length <= 8) return 'Пароль должен быть длиннее 8 символов';
    }
    
    return undefined;
  };

  // ИСПРАВЛЕНО: убрана лишняя запятая
  const isFormFilled = (): boolean => {
    return (
      formData.username.trim() !== '' &&
      formData.name.trim() !== '' &&
      formData.password.trim() !== ''
    );
  };

  const canSubmit = (): boolean => {
    // Проверяем, что не в процессе загрузки
    if (isLoading) return false;
    
    // Проверяем, что все поля заполнены
    if (!isFormFilled()) return false;
    
    // Проверяем, что нет ошибок валидации
    const usernameError = validateField('username', formData.username);
    const passwordError = validateField('password', formData.password);
    
    return !usernameError && !passwordError;
  };

  const handleChange = (field: keyof UserCreate, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Валидируем поле при изменении, если оно уже было тронуто
    if (touched[field as keyof typeof touched]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field: keyof UserCreate) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field] as string);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Отмечаем все поля как "тронутые"
    setTouched({ username: true, password: true });
    
    // Проверяем, можно ли отправить форму
    if (!canSubmit()) {
      return;
    }
    
    await onCreate(formData);
    setFormData({
      username: '',
      name: '',
      password: '',
      role: 'employee',
    });
    setErrors({});
    setTouched({});
  };

  const handleClose = () => {
    setFormData({
      username: '',
      name: '',
      password: '',
      role: 'employee',
    });
    setErrors({});
    setTouched({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Создать пользователя"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Имя пользователя"
          type="text"
          value={formData.username}
          onChange={(e) => handleChange('username', e.target.value)}
          onBlur={() => handleBlur('username')}
          required
          placeholder="username (минимум 4 символа)"
          error={touched.username ? errors.username : undefined}
        />

        <Input
          label="Полное имя"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
          placeholder="Иван Иванов"
        />

        <Input
          label="Пароль"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          onBlur={() => handleBlur('password')}
          required
          placeholder="•••••••• (минимум 9 символов)"
          error={touched.password ? errors.password : undefined}
        />

        <Select
          label="Роль"
          value={formData.role}
          onChange={(e) => handleChange('role', e.target.value as UserRole)}
          required
          options={[
            { value: 'employee', label: 'Сотрудник' },
            { value: 'manager', label: 'Менеджер' },
          ]}
        />

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Отмена
          </Button>
          <Button 
            type="submit" 
            isLoading={isLoading}
            disabled={!canSubmit()}
          >
            Создать
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}