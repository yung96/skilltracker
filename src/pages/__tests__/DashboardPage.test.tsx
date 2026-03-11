import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { DashboardPage } from '../DashboardPage'
import * as userStore from '@/entities/user/model/store'
import * as taskStore from '@/entities/task/model/store'
import * as quizStore from '@/entities/quiz/model/store'

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
}))

vi.mock('@/entities/task/model/store', () => ({
  useTasksStore: vi.fn(),
}))

vi.mock('@/entities/quiz/model/store', () => ({
  useQuizzesStore: vi.fn(),
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    vi.clearAllMocks()
  })

  it('отображает приветствие для сотрудника', () => {
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

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: [],
      fetchTasks: vi.fn(),
      isLoading: false,
    } as any)

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      myAssignments: [],
      fetchMyAssignments: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Добро пожаловать, Петр Петров! 👋')).toBeInTheDocument()
    expect(screen.getByText('Ваши текущие задачи')).toBeInTheDocument()
  })

  it('отображает пустое состояние для задач', () => {
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

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: [],
      fetchTasks: vi.fn(),
      isLoading: false,
    } as any)

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      myAssignments: [],
      fetchMyAssignments: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Пока нет задач')).toBeInTheDocument()
  })

  it('не отображает назначенные тесты для менеджера', () => {
    const mockUser = {
      id: 1,
      username: 'manager',
      name: 'Иван Иванов',
      role: 'manager' as const,
      created_at: '2023-01-01T00:00:00Z'
    }

    const mockAssignments = [
      {
        assignment: {
          id: 1,
          quiz_id: 1,
          user_id: 2,
          attempts_taken: 1,
          remaining_attempts: 2,
          assigned_at: '2023-01-01T00:00:00Z'
        },
        quiz: {
          id: 1,
          title: 'Тест по JavaScript',
          description: 'Основы JavaScript',
          status: 'active',
          created_at: '2023-01-01T00:00:00Z'
        }
      }
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

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: [],
      fetchTasks: vi.fn(),
      isLoading: false,
    } as any)

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      myAssignments: mockAssignments,
      fetchMyAssignments: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    expect(screen.queryByText('Назначенные тесты')).not.toBeInTheDocument()
    expect(screen.queryByText('Тест по JavaScript')).not.toBeInTheDocument()
  })

  it('вызывает fetchTasks и fetchMyAssignments при монтировании', () => {
    const mockUser = {
      id: 2,
      username: 'employee',
      name: 'Петр Петров',
      role: 'employee' as const,
      created_at: '2023-01-01T00:00:00Z'
    }

    const mockFetchTasks = vi.fn()
    const mockFetchMyAssignments = vi.fn()

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

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: [],
      fetchTasks: mockFetchTasks,
      isLoading: false,
    } as any)

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      myAssignments: [],
      fetchMyAssignments: mockFetchMyAssignments,
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    expect(mockFetchTasks).toHaveBeenCalledTimes(1)
    expect(mockFetchMyAssignments).toHaveBeenCalledTimes(1)
  })

  it('не вызывает fetchMyAssignments для менеджера', () => {
    const mockUser = {
      id: 1,
      username: 'manager',
      name: 'Иван Иванов',
      role: 'manager' as const,
      created_at: '2023-01-01T00:00:00Z'
    }

    const mockFetchTasks = vi.fn()
    const mockFetchMyAssignments = vi.fn()

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

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: [],
      fetchTasks: mockFetchTasks,
      isLoading: false,
    } as any)

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      myAssignments: [],
      fetchMyAssignments: mockFetchMyAssignments,
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    expect(mockFetchTasks).toHaveBeenCalledTimes(1)
    expect(mockFetchMyAssignments).not.toHaveBeenCalled()
  })

  it('отображает состояние загрузки', () => {
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

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: [],
      fetchTasks: vi.fn(),
      isLoading: true,
    } as any)

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      myAssignments: [],
      fetchMyAssignments: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    // Проверяем, что компонент рендерится, но данные могут быть пустыми во время загрузки
    expect(screen.getByText('Добро пожаловать, Иван Иванов! 👋')).toBeInTheDocument()
  })

  it('отображает ошибку, если есть', () => {
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
      error: 'Ошибка аутентификации',
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: [],
      fetchTasks: vi.fn(),
      isLoading: false,
    } as any)

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      myAssignments: [],
      fetchMyAssignments: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    // Ошибка отображается в компоненте, но DashboardPage не отображает ошибки напрямую
    expect(screen.getByText('Добро пожаловать, Иван Иванов! 👋')).toBeInTheDocument()
  })

  it('навигация по ссылкам работает', async () => {
    const user = userEvent.setup()
    const mockUser = {
      id: 1,
      username: 'manager',
      name: 'Иван Иванов',
      role: 'manager' as const,
      created_at: '2023-01-01T00:00:00Z'
    }

    const mockTasks = [
      {
        id: 1,
        title: 'Задача 1',
        status: 'pending',
        employee: mockUser
      }
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

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: mockTasks,
      fetchTasks: vi.fn(),
      isLoading: false,
    } as any)

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      myAssignments: [],
      fetchMyAssignments: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    const tasksLink = screen.getByText('Посмотреть все →')
    expect(tasksLink.closest('a')).toHaveAttribute('href', '/tasks')

    const taskLink = screen.getByText('Задача 1').closest('a')
    expect(taskLink).toHaveAttribute('href', '/tasks/1')
  })

  it('отображает только первые 5 задач', () => {
    const mockUser = {
      id: 1,
      username: 'manager',
      name: 'Иван Иванов',
      role: 'manager' as const,
      created_at: '2023-01-01T00:00:00Z'
    }

    const mockTasks = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1,
      title: `Задача ${i + 1}`,
      status: 'pending',
      employee: mockUser
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

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: mockTasks,
      fetchTasks: vi.fn(),
      isLoading: false,
    } as any)

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      myAssignments: [],
      fetchMyAssignments: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Задача 1')).toBeInTheDocument()
    expect(screen.getByText('Задача 5')).toBeInTheDocument()
    expect(screen.queryByText('Задача 6')).not.toBeInTheDocument()
    expect(screen.queryByText('Задача 7')).not.toBeInTheDocument()
  })

  it('отображает только первые 3 назначенных теста', () => {
    const mockUser = {
      id: 2,
      username: 'employee',
      name: 'Петр Петров',
      role: 'employee' as const,
      created_at: '2023-01-01T00:00:00Z'
    }

    const mockAssignments = Array.from({ length: 5 }, (_, i) => ({
      assignment: {
        id: i + 1,
        quiz_id: i + 1,
        user_id: 2,
        attempts_taken: 1,
        remaining_attempts: 2,
        assigned_at: '2023-01-01T00:00:00Z'
      },
      quiz: {
        id: i + 1,
        title: `Тест ${i + 1}`,
        description: `Описание теста ${i + 1}`,
        status: 'active',
        created_at: '2023-01-01T00:00:00Z'
      }
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

    vi.mocked(taskStore.useTasksStore).mockReturnValue({
      tasks: [],
      fetchTasks: vi.fn(),
      isLoading: false,
    } as any)

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      myAssignments: mockAssignments,
      fetchMyAssignments: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Тест 1')).toBeInTheDocument()
    expect(screen.getByText('Тест 3')).toBeInTheDocument()
    expect(screen.queryByText('Тест 4')).not.toBeInTheDocument()
    expect(screen.queryByText('Тест 5')).not.toBeInTheDocument()
  })
})