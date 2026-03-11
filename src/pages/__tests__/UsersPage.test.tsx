import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { UsersPage } from '../UsersPage'
import * as userStore from '@/entities/user/model/store'

// Mock для stores
vi.mock('@/entities/user/model/store', () => ({
  useUsersStore: vi.fn(),
}))

// Mock для компонентов
vi.mock('@/features/users/UserFilters', () => ({
  UserFilters: ({ onSearchChange, onRoleChange }: any) => (
    <div data-testid="user-filters">
      <input
        data-testid="search-input"
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Поиск..."
      />
      <select
        data-testid="role-select"
        onChange={(e) => onRoleChange(e.target.value)}
      >
        <option value="">Все роли</option>
        <option value="manager">Менеджер</option>
        <option value="employee">Сотрудник</option>
      </select>
    </div>
  ),
}))

vi.mock('@/features/users/UserCard', () => ({
  UserCard: ({ user, onDelete }: any) => (
    <div data-testid={`user-card-${user.id}`}>
      <h3>{user.name}</h3>
      <button data-testid={`delete-user-${user.id}`} onClick={() => onDelete(user.id)}>
        Удалить
      </button>
    </div>
  ),
}))

vi.mock('@/features/users/UserCreateModal', () => ({
  UserCreateModal: ({ isOpen, onClose, onCreate }: any) => (
    isOpen ? (
      <div data-testid="user-create-modal">
        <button data-testid="close-modal" onClick={onClose}>
          Закрыть
        </button>
        <button
          data-testid="create-user-btn"
          onClick={() => onCreate({ username: 'newuser', name: 'Новый Пользователь', role: 'employee' })}
        >
          Создать
        </button>
      </div>
    ) : null
  ),
}))

describe('UsersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('отображает заголовок и кнопку добавления', () => {
    const mockUsers: any[] = []
    const mockFetchUsers = vi.fn()

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: mockUsers,
      fetchUsers: mockFetchUsers,
      createUser: vi.fn(),
      deleteUser: vi.fn(),
      fetchUser: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      selectedUser: null,
      isLoading: false,
      error: null,
    } as any)

    render(<UsersPage />)

    expect(screen.getByText('Пользователи')).toBeInTheDocument()
    expect(screen.getByText('Управление командой')).toBeInTheDocument()
    expect(screen.getByText('Добавить пользователя')).toBeInTheDocument()
    expect(screen.getByTestId('user-filters')).toBeInTheDocument()
  })

  it('вызывает fetchUsers при монтировании', () => {
    const mockFetchUsers = vi.fn()

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: [],
      fetchUsers: mockFetchUsers,
      createUser: vi.fn(),
      deleteUser: vi.fn(),
      fetchUser: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      selectedUser: null,
      isLoading: false,
      error: null,
    } as any)

    render(<UsersPage />)

    expect(mockFetchUsers).toHaveBeenCalledWith({})
  })

  it('отображает список пользователей', () => {
    const mockUsers = [
      { id: 1, username: 'user1', name: 'Пользователь 1', role: 'employee', created_at: '2023-01-01T00:00:00Z' },
      { id: 2, username: 'user2', name: 'Пользователь 2', role: 'manager', created_at: '2023-01-01T00:00:00Z' },
    ]
    const mockFetchUsers = vi.fn()

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: mockUsers,
      fetchUsers: mockFetchUsers,
      createUser: vi.fn(),
      deleteUser: vi.fn(),
      fetchUser: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      selectedUser: null,
      isLoading: false,
      error: null,
    } as any)

    render(<UsersPage />)

    expect(screen.getByTestId('user-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('user-card-2')).toBeInTheDocument()
    expect(screen.getByText('Пользователь 1')).toBeInTheDocument()
    expect(screen.getByText('Пользователь 2')).toBeInTheDocument()
  })

  it('отображает пустое состояние', () => {
    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: [],
      fetchUsers: vi.fn(),
      createUser: vi.fn(),
      deleteUser: vi.fn(),
      fetchUser: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      selectedUser: null,
      isLoading: false,
      error: null,
    } as any)

    render(<UsersPage />)

    expect(screen.getByText('Пользователей не найдено')).toBeInTheDocument()
    expect(screen.getByText('Создайте первого пользователя')).toBeInTheDocument()
  })

  it('обрабатывает изменение роли', async () => {
    const user = userEvent.setup()
    const mockFetchUsers = vi.fn()

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: [],
      fetchUsers: mockFetchUsers,
      createUser: vi.fn(),
      deleteUser: vi.fn(),
      fetchUser: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      selectedUser: null,
      isLoading: false,
      error: null,
    } as any)

    render(<UsersPage />)

    const roleSelect = screen.getByTestId('role-select')
    await user.selectOptions(roleSelect, 'manager')

    await waitFor(() => {
      expect(mockFetchUsers).toHaveBeenCalledWith({ role: 'manager' })
    })
  })

  it('открывает модальное окно создания', async () => {
    const user = userEvent.setup()

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: [],
      fetchUsers: vi.fn(),
      createUser: vi.fn(),
      deleteUser: vi.fn(),
      fetchUser: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      selectedUser: null,
      isLoading: false,
      error: null,
    } as any)

    render(<UsersPage />)

    const createButton = screen.getByText('Добавить пользователя')
    await user.click(createButton)

    expect(screen.getByTestId('user-create-modal')).toBeInTheDocument()
  })

  it('создает пользователя', async () => {
    const user = userEvent.setup()
    const mockCreateUser = vi.fn()

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: [],
      fetchUsers: vi.fn(),
      createUser: mockCreateUser,
      deleteUser: vi.fn(),
      fetchUser: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      selectedUser: null,
      isLoading: false,
      error: null,
    } as any)

    render(<UsersPage />)

    // Открыть модальное окно
    const createButton = screen.getByText('Добавить пользователя')
    await user.click(createButton)

    // Создать пользователя
    const createUserBtn = screen.getByTestId('create-user-btn')
    await user.click(createUserBtn)

    expect(mockCreateUser).toHaveBeenCalledWith({ username: 'newuser', name: 'Новый Пользователь', role: 'employee' })
  })

  it('удаляет пользователя', async () => {
    const user = userEvent.setup()
    const mockDeleteUser = vi.fn()
    const mockUsers = [{ id: 1, username: 'user1', name: 'Пользователь 1', role: 'employee', created_at: '2023-01-01T00:00:00Z' }]

    // Mock window.confirm
    global.confirm = vi.fn(() => true)

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: mockUsers,
      fetchUsers: vi.fn(),
      createUser: vi.fn(),
      deleteUser: mockDeleteUser,
      fetchUser: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      selectedUser: null,
      isLoading: false,
      error: null,
    } as any)

    render(<UsersPage />)

    const deleteButton = screen.getByTestId('delete-user-1')
    await user.click(deleteButton)

    expect(global.confirm).toHaveBeenCalledWith('Вы уверены, что хотите удалить этого пользователя?')
    expect(mockDeleteUser).toHaveBeenCalledWith(1)
  })

  it('отображает пагинацию', () => {
    const mockUsers = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      username: `user${i + 1}`,
      name: `Пользователь ${i + 1}`,
      role: 'employee',
      created_at: '2023-01-01T00:00:00Z'
    }))
    const mockFetchUsers = vi.fn()

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: mockUsers,
      fetchUsers: mockFetchUsers,
      createUser: vi.fn(),
      deleteUser: vi.fn(),
      fetchUser: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      selectedUser: null,
      isLoading: false,
      error: null,
    } as any)

    render(<UsersPage />)

    expect(screen.getByText('Следующая')).toBeInTheDocument()
  })

  it('не отображает пагинацию при менее 20 пользователей', () => {
    const mockUsers = [
      { id: 1, username: 'user1', name: 'Пользователь 1', role: 'employee', created_at: '2023-01-01T00:00:00Z' },
    ]

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: mockUsers,
      fetchUsers: vi.fn(),
      createUser: vi.fn(),
      deleteUser: vi.fn(),
      fetchUser: vi.fn(),
      updateUser: vi.fn(),
      clearError: vi.fn(),
      selectedUser: null,
      isLoading: false,
      error: null,
    } as any)

    render(<UsersPage />)

    expect(screen.queryByText('Предыдущая')).not.toBeInTheDocument()
    expect(screen.queryByText('Следующая')).not.toBeInTheDocument()
  })
})
