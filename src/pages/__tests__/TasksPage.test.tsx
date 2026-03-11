import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { TasksPage } from '../TasksPage'
import * as userStore from '@/entities/user/model/store'
import * as taskStore from '@/entities/task/model/store'

// Mock для useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock для stores
vi.mock('@/entities/user/model/store', () => ({
  useAuthStore: vi.fn(),
  useUsersStore: vi.fn(),
}))

vi.mock('@/entities/task/model/store', () => ({
  useTasksStore: vi.fn(),
}))

// Mock для компонентов
vi.mock('@/features/tasks/TaskFilters', () => ({
  TaskFilters: ({ onSearchChange, onStatusChange, onEmployeeChange }: any) => (
    <div data-testid="task-filters">
      <input
        data-testid="search-input"
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Поиск задач"
      />
      <select
        data-testid="status-select"
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="">Все статусы</option>
        <option value="pending">Ожидает</option>
        <option value="in_progress">В работе</option>
        <option value="done">Выполнено</option>
      </select>
      <select
        data-testid="employee-select"
        onChange={(e) => onEmployeeChange(e.target.value)}
      >
        <option value="">Все сотрудники</option>
      </select>
    </div>
  ),
}))

vi.mock('@/features/tasks/TaskCard', () => ({
  TaskCard: ({ task }: any) => (
    <div data-testid={`task-card-${task.id}`}>
      {task.title}
    </div>
  ),
}))

describe('TasksPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    vi.clearAllMocks()
  })

  it('отображает заголовок и кнопку создания для менеджера', () => {
    const mockUser = {
      id: 1,
      username: 'manager',
      name: 'Иван Иванов',
      role: 'manager' as const,
      created_at: '2023-01-01T00:00:00Z'
    }

    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: [],
      fetchUsers: vi.fn(),
      isLoading: false,
    } as any)

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: [],
      fetchTasks: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Задачи')).toBeInTheDocument()
    expect(screen.getByText('Управление задачами и проектами')).toBeInTheDocument()
    expect(screen.getByText('Создать задачу')).toBeInTheDocument()
  })

  it('не отображает кнопку создания для сотрудника', () => {
    const mockUser = {
      id: 2,
      username: 'employee',
      name: 'Петр Петров',
      role: 'employee' as const,
      created_at: '2023-01-01T00:00:00Z'
    }

    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: [],
      fetchUsers: vi.fn(),
      isLoading: false,
    } as any)

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: [],
      fetchTasks: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    )

    expect(screen.queryByText('Создать задачу')).not.toBeInTheDocument()
  })

  it('вызывает fetchTasks и fetchUsers при монтировании для менеджера', () => {
    const mockUser = {
      id: 1,
      username: 'manager',
      name: 'Иван Иванов',
      role: 'manager' as const,
      created_at: '2023-01-01T00:00:00Z'
    }

    const mockFetchTasks = vi.fn()
    const mockFetchUsers = vi.fn()

    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: [],
      fetchUsers: mockFetchUsers,
      isLoading: false,
    } as any)

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: [],
      fetchTasks: mockFetchTasks,
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    )

    expect(mockFetchTasks).toHaveBeenCalledWith({})
    expect(mockFetchUsers).toHaveBeenCalledTimes(1)
  })

  it('вызывает только fetchTasks для сотрудника', () => {
    const mockUser = {
      id: 2,
      username: 'employee',
      name: 'Петр Петров',
      role: 'employee' as const,
      created_at: '2023-01-01T00:00:00Z'
    }

    const mockFetchTasks = vi.fn()
    const mockFetchUsers = vi.fn()

    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: [],
      fetchUsers: mockFetchUsers,
      isLoading: false,
    } as any)

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: [],
      fetchTasks: mockFetchTasks,
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    )

    expect(mockFetchTasks).toHaveBeenCalledWith({})
    expect(mockFetchUsers).not.toHaveBeenCalled()
  })

  it('отображает состояние загрузки при первой загрузке', () => {
    const mockUser = {
      id: 1,
      username: 'manager',
      name: 'Иван Иванов',
      role: 'manager' as const,
      created_at: '2023-01-01T00:00:00Z'
    }

    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: [],
      fetchUsers: vi.fn(),
      isLoading: false,
    } as any)

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: [],
      fetchTasks: vi.fn(),
      isLoading: true,
    } as any)

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    )

    // Проверяем, что есть элемент с классом animate-spin (Loader)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('отображает задачи', () => {
    const mockUser = {
      id: 1,
      username: 'manager',
      name: 'Иван Иванов',
      role: 'manager' as const,
      created_at: '2023-01-01T00:00:00Z'
    }

    const mockTasks = [
      { id: 1, title: 'Задача 1', status: 'pending' },
      { id: 2, title: 'Задача 2', status: 'in_progress' },
    ]

    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: [],
      fetchUsers: vi.fn(),
      isLoading: false,
    } as any)

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: mockTasks,
      fetchTasks: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('task-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('task-card-2')).toBeInTheDocument()
    expect(screen.getByText('Задача 1')).toBeInTheDocument()
    expect(screen.getByText('Задача 2')).toBeInTheDocument()
  })

  it('отображает пустое состояние', () => {
    const mockUser = {
      id: 1,
      username: 'manager',
      name: 'Иван Иванов',
      role: 'manager' as const,
      created_at: '2023-01-01T00:00:00Z'
    }

    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: [],
      fetchUsers: vi.fn(),
      isLoading: false,
    } as any)

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: [],
      fetchTasks: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Задач не найдено')).toBeInTheDocument()
    expect(screen.getByText('Создайте первую задачу')).toBeInTheDocument()
  })

  it('обновляет фильтры при изменении статуса', async () => {
    const user = userEvent.setup()
    const mockUser = {
      id: 1,
      username: 'manager',
      name: 'Иван Иванов',
      role: 'manager' as const,
      created_at: '2023-01-01T00:00:00Z'
    }

    const mockFetchTasks = vi.fn()

    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: [],
      fetchUsers: vi.fn(),
      isLoading: false,
    } as any)

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: [],
      fetchTasks: mockFetchTasks,
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    )

    const statusSelect = screen.getByTestId('status-select')
    await user.selectOptions(statusSelect, 'pending')

    await waitFor(() => {
      expect(mockFetchTasks).toHaveBeenCalledWith({ status: 'pending' })
    })
  })

  it('отображает пагинацию при 20 задачах', () => {
    const mockUser = {
      id: 1,
      username: 'manager',
      name: 'Иван Иванов',
      role: 'manager' as const,
      created_at: '2023-01-01T00:00:00Z'
    }

    const mockTasks = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      title: `Задача ${i + 1}`,
      status: 'pending'
    }))

    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: [],
      fetchUsers: vi.fn(),
      isLoading: false,
    } as any)

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: mockTasks,
      fetchTasks: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Предыдущая')).toBeInTheDocument()
    expect(screen.getByText('Следующая')).toBeInTheDocument()
  })

  it('не отображает пагинацию при менее 20 задач', () => {
    const mockUser = {
      id: 1,
      username: 'manager',
      name: 'Иван Иванов',
      role: 'manager' as const,
      created_at: '2023-01-01T00:00:00Z'
    }

    const mockTasks = [
      { id: 1, title: 'Задача 1', status: 'pending' },
    ]

    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    vi.mocked(userStore.useUsersStore).mockReturnValue({
      users: [],
      fetchUsers: vi.fn(),
      isLoading: false,
    } as any)

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: mockTasks,
      fetchTasks: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <TasksPage />
      </BrowserRouter>
    )

    expect(screen.queryByText('Предыдущая')).not.toBeInTheDocument()
    expect(screen.queryByText('Следующая')).not.toBeInTheDocument()
  })
})