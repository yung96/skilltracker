import { useState } from 'react';
import { Modal, ModalFooter, Input, Select, Button } from '@/shared/ui';
import type { UserCreate, UserRole } from '@/shared/api/types';

interface UserCreateModalProps {
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onCreate: (data: UserCreate) => Promise<void>;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate(formData);
    setFormData({
      username: '',
      name: '',
      password: '',
      role: 'employee',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Создать пользователя"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Имя пользователя"
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
          placeholder="username"
        />

        <Input
          label="Полное имя"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Иван Иванов"
        />

        <Input
          label="Пароль"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
          placeholder="••••••••"
        />

        <Select
          label="Роль"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
          options={[
            { value: 'employee', label: 'Сотрудник' },
            { value: 'manager', label: 'Менеджер' },
          ]}
        />

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Создать
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
