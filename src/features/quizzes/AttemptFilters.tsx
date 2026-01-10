import { useMemo } from 'react';
import { Card, Select } from '@/shared/ui';
import type { User } from '@/shared/api/types';

interface AttemptFiltersProps {
  employeeFilter: string;
  employees: User[];
  onEmployeeChange: (value: string) => void;
}

export function AttemptFilters({
  employeeFilter,
  employees,
  onEmployeeChange,
}: AttemptFiltersProps) {
  const employeeOptions = useMemo(() => {
    return [
      { value: '', label: 'Все сотрудники' },
      ...employees.map((e) => ({ value: String(e.id), label: e.name })),
    ];
  }, [employees]);

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Фильтр по сотруднику
          </label>
          <Select
            value={employeeFilter}
            onChange={(e) => onEmployeeChange(e.target.value)}
            options={employeeOptions}
          />
        </div>
      </div>
    </Card>
  );
}
