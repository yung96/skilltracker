import { useMemo } from 'react';
import { Card, Input, Select } from '@/shared/ui';
import type { User } from '@/shared/api/types';

interface UserFiltersProps {
  search: string;
  roleFilter: string;
  users: User[];
  onSearchChange: (value: string) => void;
  onRoleChange: (value: string) => void;
}

export function UserFilters({
  search,
  roleFilter,
  users,
  onSearchChange,
  onRoleChange,
}: UserFiltersProps) {
  const roleCounts = useMemo(() => {
    return {
      manager: users.filter((u) => u.role === 'manager').length,
      employee: users.filter((u) => u.role === 'employee').length,
    };
  }, [users]);

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Поиск */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Поиск
          </label>
          <Input
            type="text"
            placeholder="Поиск по имени или username..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        {/* Фильтр по роли */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Роль
          </label>
          <Select
            value={roleFilter}
            onChange={(e) => onRoleChange(e.target.value)}
            options={[
              { value: '', label: 'Все роли' },
              { value: 'manager', label: `Менеджеры (${roleCounts.manager})` },
              { value: 'employee', label: `Сотрудники (${roleCounts.employee})` },
            ]}
          />
        </div>
      </div>
    </Card>
  );
}
