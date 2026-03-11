import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { QuizzesPage } from '../QuizzesPage'
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
vi.mock('@/entities/quiz/model/store', () => ({
  useQuizzesStore: vi.fn(),
}))

// Mock для компонентов
vi.mock('@/features/quizzes/QuizFilters', () => ({
  QuizFilters: ({ onSearchChange, onStatusChange }: any) => (
    <div data-testid="quiz-filters">
      <input
        data-testid="search-input"
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Поиск..."
      />
      <select
        data-testid="status-select"
        onChange={(e) => onStatusChange(e.target.value)}
      >
        <option value="">Все статусы</option>
        <option value="active">Активные</option>
        <option value="draft">Черновики</option>
      </select>
    </div>
  ),
}))

vi.mock('@/features/quizzes/QuizCard', () => ({
  QuizCard: ({ quiz, onDelete }: any) => (
    <div data-testid={`quiz-card-${quiz.id}`}>
      <h3>{quiz.title}</h3>
      <button data-testid={`delete-quiz-${quiz.id}`} onClick={() => onDelete(quiz.id)}>
        Удалить
      </button>
    </div>
  ),
}))

vi.mock('@/features/quizzes/QuizCreateModal', () => ({
  QuizCreateModal: ({ isOpen, onClose, onCreate }: any) => (
    isOpen ? (
      <div data-testid="quiz-create-modal">
        <button data-testid="close-modal" onClick={onClose}>
          Закрыть
        </button>
        <button
          data-testid="create-quiz-btn"
          onClick={() => onCreate({ title: 'Новый тест', description: 'Описание' })}
        >
          Создать
        </button>
      </div>
    ) : null
  ),
}))

describe('QuizzesPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    vi.clearAllMocks()
  })

  it('отображает заголовок и кнопки', () => {
    const mockQuizzes: any[] = []
    const mockFetchQuizzes = vi.fn()

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      quizzes: mockQuizzes,
      fetchQuizzes: mockFetchQuizzes,
      createQuiz: vi.fn(),
      deleteQuiz: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <QuizzesPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Тесты')).toBeInTheDocument()
    expect(screen.getByText('Управление тестами и вопросами')).toBeInTheDocument()
    expect(screen.getByText('Вопросы')).toBeInTheDocument()
    expect(screen.getByText('Создать тест')).toBeInTheDocument()
    expect(screen.getByTestId('quiz-filters')).toBeInTheDocument()
  })

  it('вызывает fetchQuizzes при монтировании', () => {
    const mockFetchQuizzes = vi.fn()

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      quizzes: [],
      fetchQuizzes: mockFetchQuizzes,
      createQuiz: vi.fn(),
      deleteQuiz: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <QuizzesPage />
      </BrowserRouter>
    )

    expect(mockFetchQuizzes).toHaveBeenCalledWith({})
  })

  it('отображает список тестов', () => {
    const mockQuizzes = [
      { id: 1, title: 'Тест 1', description: 'Описание 1', status: 'active' },
      { id: 2, title: 'Тест 2', description: 'Описание 2', status: 'draft' },
    ]
    const mockFetchQuizzes = vi.fn()

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      quizzes: mockQuizzes,
      fetchQuizzes: mockFetchQuizzes,
      createQuiz: vi.fn(),
      deleteQuiz: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <QuizzesPage />
      </BrowserRouter>
    )

    expect(screen.getByTestId('quiz-card-1')).toBeInTheDocument()
    expect(screen.getByTestId('quiz-card-2')).toBeInTheDocument()
    expect(screen.getByText('Тест 1')).toBeInTheDocument()
    expect(screen.getByText('Тест 2')).toBeInTheDocument()
  })

  it('отображает пустое состояние', () => {
    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      quizzes: [],
      fetchQuizzes: vi.fn(),
      createQuiz: vi.fn(),
      deleteQuiz: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <QuizzesPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Тестов не найдено')).toBeInTheDocument()
    expect(screen.getByText('Создайте первый тест')).toBeInTheDocument()
  })

  it('обрабатывает изменение статуса', async () => {
    const user = userEvent.setup()
    const mockFetchQuizzes = vi.fn()

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      quizzes: [],
      fetchQuizzes: mockFetchQuizzes,
      createQuiz: vi.fn(),
      deleteQuiz: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <QuizzesPage />
      </BrowserRouter>
    )

    const statusSelect = screen.getByTestId('status-select')
    await user.selectOptions(statusSelect, 'active')

    expect(mockFetchQuizzes).toHaveBeenCalledWith({ status: 'active' })
  })

  it('открывает модальное окно создания', async () => {
    const user = userEvent.setup()

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      quizzes: [],
      fetchQuizzes: vi.fn(),
      createQuiz: vi.fn(),
      deleteQuiz: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <QuizzesPage />
      </BrowserRouter>
    )

    const createButton = screen.getByText('Создать тест')
    await user.click(createButton)

    expect(screen.getByTestId('quiz-create-modal')).toBeInTheDocument()
  })

  it('создает тест', async () => {
    const user = userEvent.setup()
    const mockCreateQuiz = vi.fn()

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      quizzes: [],
      fetchQuizzes: vi.fn(),
      createQuiz: mockCreateQuiz,
      deleteQuiz: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <QuizzesPage />
      </BrowserRouter>
    )

    // Открыть модальное окно
    const createButton = screen.getByText('Создать тест')
    await user.click(createButton)

    // Создать тест
    const createQuizBtn = screen.getByTestId('create-quiz-btn')
    await user.click(createQuizBtn)

    expect(mockCreateQuiz).toHaveBeenCalledWith({ title: 'Новый тест', description: 'Описание' })
  })

  it('удаляет тест', async () => {
    const user = userEvent.setup()
    const mockDeleteQuiz = vi.fn()
    const mockQuizzes = [{ id: 1, title: 'Тест 1', description: 'Описание 1', status: 'active' }]

    // Mock window.confirm
    global.confirm = vi.fn(() => true)

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      quizzes: mockQuizzes,
      fetchQuizzes: vi.fn(),
      createQuiz: vi.fn(),
      deleteQuiz: mockDeleteQuiz,
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <QuizzesPage />
      </BrowserRouter>
    )

    const deleteButton = screen.getByTestId('delete-quiz-1')
    await user.click(deleteButton)

    expect(global.confirm).toHaveBeenCalledWith('Вы уверены, что хотите удалить этот тест?')
    expect(mockDeleteQuiz).toHaveBeenCalledWith(1)
  })

  it('отображает пагинацию', () => {
    const mockQuizzes = Array.from({ length: 20 }, (_, i) => ({
      id: i + 1,
      title: `Тест ${i + 1}`,
      description: `Описание ${i + 1}`,
      status: 'active'
    }))
    const mockFetchQuizzes = vi.fn()

    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      quizzes: mockQuizzes,
      fetchQuizzes: mockFetchQuizzes,
      createQuiz: vi.fn(),
      deleteQuiz: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <QuizzesPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Следующая')).toBeInTheDocument()
  })

  it('навигация по ссылкам работает', () => {
    vi.mocked(quizStore.useQuizzesStore).mockReturnValue({
      quizzes: [],
      fetchQuizzes: vi.fn(),
      createQuiz: vi.fn(),
      deleteQuiz: vi.fn(),
      isLoading: false,
    } as any)

    render(
      <BrowserRouter>
        <QuizzesPage />
      </BrowserRouter>
    )

    const questionsLink = screen.getByText('Вопросы').closest('a')
    expect(questionsLink).toHaveAttribute('href', '/questions')
  })
})
