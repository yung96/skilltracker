import { useEffect, useState } from 'react';
import { useUsersStore } from '@/entities/user/model/store';
import { Button, Loader } from '@/shared/ui';
import { UserFilters } from '@/features/users/UserFilters';
import { UserCard } from '@/features/users/UserCard';
import { UserCreateModal } from '@/features/users/UserCreateModal';

export function UsersPage() {
  const { users, fetchUsers, createUser, deleteUser, isLoading } = useUsersStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => {
    const params: any = {};
    if (roleFilter) params.role = roleFilter;
    if (search) params.search = search;
    if (page > 1) {
      params.page = page;
      params.per_page = perPage;
    }
    fetchUsers(params);
  }, [search, roleFilter, page, fetchUsers]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleRoleChange = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  const handleCreate = async (data: any) => {
    await createUser(data);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      await deleteUser(id);
    }
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Пользователи</h1>
          <p className="text-gray-600 mt-1">
            Управление командой
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Добавить пользователя
        </Button>
      </div>

      {/* Фильтры */}
      <UserFilters
        search={search}
        roleFilter={roleFilter}
        users={users}
        onSearchChange={handleSearchChange}
        onRoleChange={handleRoleChange}
      />

      {/* Список пользователей */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader size="lg" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <UserCard key={user.id} user={user} onDelete={handleDelete} />
            ))}
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Пользователей не найдено</h3>
              <p className="text-gray-600">
                {search || roleFilter
                  ? 'Попробуйте изменить параметры поиска'
                  : 'Создайте первого пользователя'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {users.length === perPage && (
            <div className="flex justify-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Предыдущая
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => p + 1)}
              >
                Следующая
              </Button>
            </div>
          )}
        </>
      )}

      {/* Модальное окно создания пользователя */}
      <UserCreateModal
        isOpen={isModalOpen}
        isLoading={isLoading}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
