import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { LoginPage } from '../LoginPage'
import * as userStore from '@/entities/user/model/store'

// Mock для useNavigate
const mockNavigate = vi.fn() // vi.fn() создает "шпионскую" (spy) функцию, Мы можем проверить, вызывалась ли она и с какими аргументами
vi.mock('react-router-dom', async () => { // функция Vitest для подмены целого модуля, Первый аргумент - название модуля ('react-router-dom'), Второй аргумент - фабрика, которая возвращает поддельную версию модуля
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock для useAuthStore
vi.mock('@/entities/user/model/store', () => ({
  useAuthStore: vi.fn(),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    vi.clearAllMocks()
  })

  it('отображает форму входа с полями username и password', () => {
    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    expect(screen.getByText('SkillTracker')).toBeInTheDocument()
    expect(screen.getByLabelText('Имя пользователя')).toBeInTheDocument()
    expect(screen.getByLabelText('Пароль')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Войти/i })).toBeInTheDocument()
  })

  it('обновляет состояние при вводе текста', async () => {
    const user = userEvent.setup() // создаем экземпляр, который будет "нажимать клавиши"
    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const usernameInput = screen.getByPlaceholderText('username') as HTMLInputElement
    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')

    expect(usernameInput.value).toBe('testuser')
    expect(passwordInput.value).toBe('password123')
  })

  it('вызывает login при отправке формы', async () => {
    const user = userEvent.setup()
    const mockLogin = vi.fn()

    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const usernameInput = screen.getByPlaceholderText('username')
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const submitButton = screen.getByRole('button', { name: /Войти/i })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ username: 'testuser', password: 'password123' })
    })
  })

  it('перенаправляет на dashboard после успешного входа', async () => {
    const user = userEvent.setup()
    const mockLogin = vi.fn().mockResolvedValue(undefined)

    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const usernameInput = screen.getByPlaceholderText('username')
    const passwordInput = screen.getByPlaceholderText('••••••••')
    const submitButton = screen.getByRole('button', { name: /Войти/i })

    await user.type(usernameInput, 'testuser')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard')
    })
  })

  it('отображает сообщение об ошибке', () => {
    const errorMessage = 'Неверные учетные данные'
    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: errorMessage,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })


  it('требует заполнения обязательных полей', async () => {
    const user = userEvent.setup()
    const mockLogin = vi.fn()

    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    } as any)

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    )

    const submitButton = screen.getByRole('button', { name: /Войти/i })
    await user.click(submitButton)

    // Браузер должен показать ошибку валидации HTML5
    expect(mockLogin).not.toHaveBeenCalled()
  })

  it('shows validation errors when submitting empty form', async() => {
    const user = userEvent.setup()
    const mockLogin = vi.fn()

    vi.mocked(userStore.useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
      clearError: vi.fn(),
    })

    render(<BrowserRouter>
        <LoginPage />
      </BrowserRouter>)

    const submitButton = screen.getByRole('button', { name: /Войти/i })
    await user.click(submitButton)

    expect(screen.getByPlaceholderText('username')).toBeInvalid()
    expect(mockLogin).not.toHaveBeenCalled() //Эта строка проверяет, что функция логина НЕ вызывалась
  })
})

