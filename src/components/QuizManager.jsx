import { useState, useEffect } from 'react';
import { api } from '../api';

function QuizManager() {
  const [view, setView] = useState('list'); // 'list', 'questions-list', 'create-quiz', 'edit-quiz', 'create-question', 'edit-question', 'manage-sections'
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [quizzesData, questionsData, usersData, tasksData] = await Promise.all([
        api.getQuizzes(),
        api.getQuestions(),
        api.getUsers(),
        api.getTasks(),
      ]);
      setQuizzes(quizzesData);
      setQuestions(questionsData);
      setUsers(usersData);
      setTasks(tasksData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (quizData) => {
    try {
      await api.createQuiz(quizData);
      await loadData();
      setView('list');
    } catch (err) {
      alert('Ошибка создания квиза: ' + err.message);
    }
  };

  const handleUpdateQuiz = async (quizId, quizData) => {
    try {
      await api.updateQuiz(quizId, quizData);
      await loadData();
      setView('list');
      setSelectedQuiz(null);
    } catch (err) {
      alert('Ошибка обновления квиза: ' + err.message);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('Вы уверены, что хотите удалить этот квиз?')) {
      return;
    }
    try {
      await api.deleteQuiz(quizId);
      await loadData();
    } catch (err) {
      alert('Ошибка удаления квиза: ' + err.message);
    }
  };

  const handleEditQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setView('edit-quiz');
  };

  const handleCreateQuestion = async (questionData) => {
    try {
      await api.createQuestion(questionData);
      await loadData();
      setView('questions-list');
    } catch (err) {
      alert('Ошибка создания вопроса: ' + err.message);
    }
  };

  const handleUpdateQuestion = async (questionId, questionData) => {
    try {
      await api.updateQuestion(questionId, questionData);
      await loadData();
      setView('questions-list');
      setSelectedQuestion(null);
    } catch (err) {
      alert('Ошибка обновления вопроса: ' + err.message);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      return;
    }
    try {
      await api.deleteQuestion(questionId);
      await loadData();
    } catch (err) {
      alert('Ошибка удаления вопроса: ' + err.message);
    }
  };

  const handleEditQuestion = (question) => {
    setSelectedQuestion(question);
    setView('edit-question');
  };

  const handleManageSections = (quiz) => {
    setSelectedQuiz(quiz);
    setView('manage-sections');
  };

  if (loading && quizzes.length === 0) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="quiz-manager">
      {view === 'list' && (
        <QuizList
          quizzes={quizzes}
          questions={questions}
          onCreateQuiz={() => setView('create-quiz')}
          onCreateQuestion={() => setView('create-question')}
          onViewQuestions={() => setView('questions-list')}
          onEditQuiz={handleEditQuiz}
          onDeleteQuiz={handleDeleteQuiz}
          onManageSections={handleManageSections}
          users={users}
          tasks={tasks}
          onRefresh={loadData}
        />
      )}

      {view === 'questions-list' && (
        <QuestionsList
          questions={questions}
          onBack={() => setView('list')}
          onCreate={() => setView('create-question')}
          onEdit={handleEditQuestion}
          onDelete={handleDeleteQuestion}
        />
      )}

      {view === 'create-quiz' && (
        <CreateQuizForm onSubmit={handleCreateQuiz} onCancel={() => setView('list')} />
      )}

      {view === 'edit-quiz' && selectedQuiz && (
        <EditQuizForm
          quiz={selectedQuiz}
          onSubmit={(data) => handleUpdateQuiz(selectedQuiz.id, data)}
          onCancel={() => {
            setView('list');
            setSelectedQuiz(null);
          }}
        />
      )}

      {view === 'create-question' && (
        <CreateQuestionForm onSubmit={handleCreateQuestion} onCancel={() => setView('questions-list')} />
      )}

      {view === 'edit-question' && selectedQuestion && (
        <EditQuestionForm
          question={selectedQuestion}
          onSubmit={(data) => handleUpdateQuestion(selectedQuestion.id, data)}
          onCancel={() => {
            setView('questions-list');
            setSelectedQuestion(null);
          }}
        />
      )}

      {view === 'manage-sections' && selectedQuiz && (
        <ManageSections
          quiz={selectedQuiz}
          questions={questions}
          onBack={() => {
            setView('list');
            setSelectedQuiz(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

function QuizList({ quizzes, questions, onCreateQuiz, onCreateQuestion, onViewQuestions, onEditQuiz, onDeleteQuiz, onManageSections, users, tasks, onRefresh }) {
  const [showAssignModal, setShowAssignModal] = useState(null);

  const handleAssign = async (quizId, assignmentData) => {
    try {
      await api.assignQuiz(quizId, assignmentData);
      setShowAssignModal(null);
      alert('Квиз назначен успешно!');
      onRefresh();
    } catch (err) {
      alert('Ошибка назначения: ' + err.message);
    }
  };

  return (
    <div className="quiz-list">
      <div className="page-header">
        <h2>Управление квизами</h2>
        <div className="header-actions">
          <button className="btn btn-info" onClick={onViewQuestions}>
            📋 Вопросы
          </button>
          <button className="btn btn-secondary" onClick={onCreateQuestion}>
            + Создать вопрос
          </button>
          <button className="btn btn-primary" onClick={onCreateQuiz}>
            + Создать квиз
          </button>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{quizzes.length}</div>
          <div className="stat-label">Квизов</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{questions.length}</div>
          <div className="stat-label">Вопросов</div>
        </div>
      </div>

      <div className="quizzes-grid">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="quiz-card">
            <div className="quiz-header">
              <h3>{quiz.title}</h3>
              <span className={`status-badge ${quiz.status}`}>{quiz.status === 'draft' ? 'Черновик' : 'Опубликован'}</span>
            </div>
            {quiz.description && <p className="quiz-description">{quiz.description}</p>}
            <div className="quiz-info">
              <div className="info-item">
                <span>Проходной балл:</span>
                <strong>{quiz.pass_percent}%</strong>
              </div>
              {quiz.time_limit_seconds && (
                <div className="info-item">
                  <span>Время:</span>
                  <strong>{Math.floor(quiz.time_limit_seconds / 60)} мин</strong>
                </div>
              )}
              {quiz.max_attempts && (
                <div className="info-item">
                  <span>Попыток:</span>
                  <strong>{quiz.max_attempts}</strong>
                </div>
              )}
            </div>
            <div className="quiz-actions">
              <button className="btn btn-small btn-secondary" onClick={() => onManageSections(quiz)}>
                Управление секциями
              </button>
              <button className="btn btn-small btn-warning" onClick={() => onEditQuiz(quiz)}>
                ✏️ Редактировать
              </button>
              <button className="btn btn-small btn-primary" onClick={() => setShowAssignModal(quiz)}>
                Назначить
              </button>
              <button className="btn btn-small btn-danger" onClick={() => onDeleteQuiz(quiz.id)}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAssignModal && (
        <AssignQuizModal
          quiz={showAssignModal}
          users={users}
          tasks={tasks}
          onAssign={(data) => handleAssign(showAssignModal.id, data)}
          onClose={() => setShowAssignModal(null)}
        />
      )}

      <style>{`
        .quiz-manager {
          padding: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .page-header h2 {
          margin: 0;
          font-size: 24px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
        }

        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #0066cc;
        }

        .stat-label {
          margin-top: 5px;
          color: #666;
          font-size: 14px;
        }

        .quizzes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .quiz-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .quiz-header h3 {
          margin: 0;
          font-size: 18px;
          flex: 1;
        }

        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge.draft {
          background: #ffeaa7;
          color: #d63031;
        }

        .status-badge.published {
          background: #d1f2eb;
          color: #00b894;
        }

        .quiz-description {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .quiz-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .info-item span {
          color: #666;
        }

        .quiz-actions {
          display: flex;
          gap: 10px;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          flex: 1;
        }

        .btn-small {
          padding: 8px 16px;
          font-size: 13px;
        }

        .btn-primary {
          background: #0066cc;
          color: white;
        }

        .btn-primary:hover {
          background: #0052a3;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }

        .btn-info {
          background: #17a2b8;
          color: white;
        }

        .btn-info:hover {
          background: #138496;
        }

        .btn-warning {
          background: #ffc107;
          color: #333;
        }

        .btn-warning:hover {
          background: #e0a800;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        .loading {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
      `}</style>
    </div>
  );
}

function CreateQuizForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pass_percent: 70,
    time_limit_seconds: null,
    shuffle_questions: false,
    shuffle_answers: false,
    allow_review: true,
    max_attempts: null,
    publish: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData };
    if (data.time_limit_seconds) {
      data.time_limit_seconds = parseInt(data.time_limit_seconds);
    }
    if (data.max_attempts) {
      data.max_attempts = parseInt(data.max_attempts);
    }
    onSubmit(data);
  };

  return (
    <div className="form-container">
      <h2>Создать квиз</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Название *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Описание</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Проходной балл (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.pass_percent}
              onChange={(e) => setFormData({ ...formData, pass_percent: parseInt(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label>Время (секунды)</label>
            <input
              type="number"
              min="0"
              value={formData.time_limit_seconds || ''}
              onChange={(e) => setFormData({ ...formData, time_limit_seconds: e.target.value || null })}
              placeholder="Без ограничения"
            />
          </div>

          <div className="form-group">
            <label>Макс. попыток</label>
            <input
              type="number"
              min="1"
              value={formData.max_attempts || ''}
              onChange={(e) => setFormData({ ...formData, max_attempts: e.target.value || null })}
              placeholder="Без ограничения"
            />
          </div>
        </div>

        <div className="form-checkboxes">
          <label>
            <input
              type="checkbox"
              checked={formData.shuffle_questions}
              onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
            />
            <span>Перемешивать вопросы</span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={formData.shuffle_answers}
              onChange={(e) => setFormData({ ...formData, shuffle_answers: e.target.checked })}
            />
            <span>Перемешивать ответы</span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={formData.allow_review}
              onChange={(e) => setFormData({ ...formData, allow_review: e.target.checked })}
            />
            <span>Разрешить просмотр результатов</span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={formData.publish}
              onChange={(e) => setFormData({ ...formData, publish: e.target.checked })}
            />
            <span>Опубликовать сразу</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary">
            Создать
          </button>
        </div>
      </form>

      <style>{`
        .form-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .form-container h2 {
          margin: 0 0 30px 0;
          font-size: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #0066cc;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .form-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 20px 0;
        }

        .form-checkboxes label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .form-checkboxes input[type="checkbox"] {
          width: auto;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 30px;
          justify-content: flex-end;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #0066cc;
          color: white;
        }

        .btn-primary:hover {
          background: #0052a3;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }
      `}</style>
    </div>
  );
}

function EditQuizForm({ quiz, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: quiz.title,
    description: quiz.description || '',
    pass_percent: quiz.pass_percent,
    time_limit_seconds: quiz.time_limit_seconds || null,
    shuffle_questions: quiz.shuffle_questions,
    shuffle_answers: quiz.shuffle_answers,
    allow_review: quiz.allow_review,
    max_attempts: quiz.max_attempts || null,
    status: quiz.status,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData };
    if (data.time_limit_seconds) {
      data.time_limit_seconds = parseInt(data.time_limit_seconds);
    }
    if (data.max_attempts) {
      data.max_attempts = parseInt(data.max_attempts);
    }
    onSubmit(data);
  };

  return (
    <div className="form-container">
      <h2>Редактировать квиз</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Название *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Описание</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Проходной балл (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.pass_percent}
              onChange={(e) => setFormData({ ...formData, pass_percent: parseInt(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label>Время (секунды)</label>
            <input
              type="number"
              min="0"
              value={formData.time_limit_seconds || ''}
              onChange={(e) => setFormData({ ...formData, time_limit_seconds: e.target.value || null })}
              placeholder="Без ограничения"
            />
          </div>

          <div className="form-group">
            <label>Макс. попыток</label>
            <input
              type="number"
              min="1"
              value={formData.max_attempts || ''}
              onChange={(e) => setFormData({ ...formData, max_attempts: e.target.value || null })}
              placeholder="Без ограничения"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Статус</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <option value="draft">Черновик</option>
            <option value="published">Опубликован</option>
          </select>
        </div>

        <div className="form-checkboxes">
          <label>
            <input
              type="checkbox"
              checked={formData.shuffle_questions}
              onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
            />
            <span>Перемешивать вопросы</span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={formData.shuffle_answers}
              onChange={(e) => setFormData({ ...formData, shuffle_answers: e.target.checked })}
            />
            <span>Перемешивать ответы</span>
          </label>

          <label>
            <input
              type="checkbox"
              checked={formData.allow_review}
              onChange={(e) => setFormData({ ...formData, allow_review: e.target.checked })}
            />
            <span>Разрешить просмотр результатов</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary">
            Сохранить изменения
          </button>
        </div>
      </form>

      <style>{`
        .form-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: white;
          border-radius: 8px;
          border: 1px solid #ddd;
        }

        .form-container h2 {
          margin: 0 0 30px 0;
          font-size: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #0066cc;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .form-checkboxes {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 20px 0;
        }

        .form-checkboxes label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .form-checkboxes input[type="checkbox"] {
          width: auto;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 30px;
          justify-content: flex-end;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #0066cc;
          color: white;
        }

        .btn-primary:hover {
          background: #0052a3;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }
      `}</style>
    </div>
  );
}

function CreateQuestionForm({ onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    text: '',
    type: 'single',
    explanation: '',
    options: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
    ],
    text_answers: [{ matcher_type: 'icontains', value: '' }],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData };
    
    if (data.type === 'text') {
      data.options = [];
      data.text_answers = data.text_answers.filter(ta => ta.value.trim());
    } else {
      data.options = data.options.filter(opt => opt.text.trim());
      data.text_answers = [];
    }
    
    onSubmit(data);
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', is_correct: false }],
    });
  };

  const removeOption = (index) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addTextAnswer = () => {
    setFormData({
      ...formData,
      text_answers: [...formData.text_answers, { matcher_type: 'icontains', value: '' }],
    });
  };

  const removeTextAnswer = (index) => {
    setFormData({
      ...formData,
      text_answers: formData.text_answers.filter((_, i) => i !== index),
    });
  };

  const updateTextAnswer = (index, field, value) => {
    const newTextAnswers = [...formData.text_answers];
    newTextAnswers[index][field] = value;
    setFormData({ ...formData, text_answers: newTextAnswers });
  };

  return (
    <div className="form-container">
      <h2>Создать вопрос</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Текст вопроса *</label>
          <textarea
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            required
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Тип вопроса</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="single">Один вариант</option>
            <option value="multiple">Несколько вариантов</option>
            <option value="text">Текстовый ответ</option>
          </select>
        </div>

        <div className="form-group">
          <label>Пояснение (необязательно)</label>
          <textarea
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            rows={2}
            placeholder="Объяснение правильного ответа"
          />
        </div>

        {formData.type !== 'text' ? (
          <div className="form-group">
            <label>Варианты ответов</label>
            <div className="options-editor">
              {formData.options.map((option, index) => (
                <div key={index} className="option-row">
                  <input
                    type="checkbox"
                    checked={option.is_correct}
                    onChange={(e) => updateOption(index, 'is_correct', e.target.checked)}
                    title="Правильный ответ"
                  />
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(index, 'text', e.target.value)}
                    placeholder={`Вариант ${index + 1}`}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeOption(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-small" onClick={addOption}>
                + Добавить вариант
              </button>
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label>Правильные ответы (шаблоны)</label>
            <div className="text-answers-editor">
              {formData.text_answers.map((ta, index) => (
                <div key={index} className="text-answer-row">
                  <select
                    value={ta.matcher_type}
                    onChange={(e) => updateTextAnswer(index, 'matcher_type', e.target.value)}
                  >
                    <option value="equals">Точное совпадение</option>
                    <option value="contains">Содержит</option>
                    <option value="icontains">Содержит (без учёта регистра)</option>
                  </select>
                  <input
                    type="text"
                    value={ta.value}
                    onChange={(e) => updateTextAnswer(index, 'value', e.target.value)}
                    placeholder="Текст ответа"
                  />
                  {formData.text_answers.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeTextAnswer(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-small" onClick={addTextAnswer}>
                + Добавить шаблон
              </button>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary">
            Создать
          </button>
        </div>
      </form>

      <style>{`
        .options-editor,
        .text-answers-editor {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .option-row,
        .text-answer-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .option-row input[type="checkbox"] {
          width: auto;
          flex-shrink: 0;
        }

        .option-row input[type="text"] {
          flex: 1;
        }

        .text-answer-row select {
          width: 200px;
          flex-shrink: 0;
        }

        .text-answer-row input {
          flex: 1;
        }

        .btn-remove {
          width: 32px;
          height: 32px;
          border: none;
          background: #fee;
          color: #c33;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .btn-remove:hover {
          background: #fcc;
        }
      `}</style>
    </div>
  );
}

function QuestionsList({ questions, onBack, onCreate, onEdit, onDelete }) {
  const [filter, setFilter] = useState('all'); // 'all', 'single', 'multiple', 'text'

  const filteredQuestions = filter === 'all' 
    ? questions 
    : questions.filter(q => q.type === filter);

  const getQuestionTypeLabel = (type) => {
    const labels = {
      single: 'Один вариант',
      multiple: 'Несколько вариантов',
      text: 'Текстовый ответ'
    };
    return labels[type] || type;
  };

  return (
    <div className="questions-list-view">
      <div className="page-header">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Назад к квизам
        </button>
        <h2>Банк вопросов</h2>
        <button className="btn btn-primary" onClick={onCreate}>
          + Создать вопрос
        </button>
      </div>

      <div className="filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Все ({questions.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'single' ? 'active' : ''}`}
          onClick={() => setFilter('single')}
        >
          Один вариант ({questions.filter(q => q.type === 'single').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'multiple' ? 'active' : ''}`}
          onClick={() => setFilter('multiple')}
        >
          Несколько вариантов ({questions.filter(q => q.type === 'multiple').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'text' ? 'active' : ''}`}
          onClick={() => setFilter('text')}
        >
          Текстовый ответ ({questions.filter(q => q.type === 'text').length})
        </button>
      </div>

      <div className="questions-grid">
        {filteredQuestions.map((question) => (
          <div key={question.id} className="question-card">
            <div className="question-header">
              <span className="question-type-badge">{getQuestionTypeLabel(question.type)}</span>
              <div className="question-actions">
                <button 
                  className="btn-icon btn-edit" 
                  onClick={() => onEdit(question)}
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button 
                  className="btn-icon btn-delete" 
                  onClick={() => onDelete(question.id)}
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="question-text">{question.text}</div>
            {question.explanation && (
              <div className="question-explanation">
                <strong>Пояснение:</strong> {question.explanation}
              </div>
            )}
            {question.type !== 'text' && question.options && question.options.length > 0 && (
              <div className="question-options">
                <strong>Варианты ответов:</strong>
                <ul>
                  {question.options.map((opt) => (
                    <li key={opt.id} className={opt.is_correct ? 'correct-option' : ''}>
                      {opt.is_correct && '✓ '}
                      {opt.text}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {question.type === 'text' && question.text_answers && question.text_answers.length > 0 && (
              <div className="question-text-answers">
                <strong>Правильные ответы:</strong>
                <ul>
                  {question.text_answers.map((ta) => (
                    <li key={ta.id}>
                      {ta.matcher_type === 'equals' && 'Точное: '}
                      {ta.matcher_type === 'contains' && 'Содержит: '}
                      {ta.matcher_type === 'icontains' && 'Содержит (без учёта регистра): '}
                      <code>{ta.value}</code>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="empty-state">
          <p>Нет вопросов для отображения</p>
        </div>
      )}

      <style>{`
        .questions-list-view {
          padding: 20px;
        }

        .filters {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 8px 16px;
          border: 1px solid #ddd;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .filter-btn:hover {
          background: #f5f5f5;
        }

        .filter-btn.active {
          background: #0066cc;
          color: white;
          border-color: #0066cc;
        }

        .questions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }

        .question-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .question-type-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          background: #e3f2fd;
          color: #1976d2;
        }

        .question-actions {
          display: flex;
          gap: 8px;
        }

        .btn-icon {
          width: 32px;
          height: 32px;
          border: none;
          background: #f0f0f0;
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.2s;
        }

        .btn-icon:hover {
          transform: scale(1.1);
        }

        .btn-edit:hover {
          background: #fff3cd;
        }

        .btn-delete:hover {
          background: #f8d7da;
        }

        .question-text {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          line-height: 1.5;
        }

        .question-explanation {
          padding: 10px;
          background: #f0f7ff;
          border-radius: 6px;
          font-size: 14px;
          color: #555;
        }

        .question-options ul,
        .question-text-answers ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }

        .question-options li,
        .question-text-answers li {
          margin: 4px 0;
          font-size: 14px;
        }

        .correct-option {
          color: #00b894;
          font-weight: 500;
        }

        .question-text-answers code {
          background: #f4f4f4;
          padding: 2px 6px;
          border-radius: 3px;
          font-family: monospace;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }
      `}</style>
    </div>
  );
}

function EditQuestionForm({ question, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    text: question.text,
    type: question.type,
    explanation: question.explanation || '',
    options: question.options && question.options.length > 0 
      ? question.options.map(opt => ({ text: opt.text, is_correct: opt.is_correct }))
      : [
          { text: '', is_correct: false },
          { text: '', is_correct: false },
        ],
    text_answers: question.text_answers && question.text_answers.length > 0
      ? question.text_answers.map(ta => ({ matcher_type: ta.matcher_type, value: ta.value }))
      : [{ matcher_type: 'icontains', value: '' }],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData };
    
    if (data.type === 'text') {
      data.options = [];
      data.text_answers = data.text_answers.filter(ta => ta.value.trim());
    } else {
      data.options = data.options.filter(opt => opt.text.trim());
      data.text_answers = [];
    }
    
    onSubmit(data);
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', is_correct: false }],
    });
  };

  const removeOption = (index) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index][field] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const addTextAnswer = () => {
    setFormData({
      ...formData,
      text_answers: [...formData.text_answers, { matcher_type: 'icontains', value: '' }],
    });
  };

  const removeTextAnswer = (index) => {
    setFormData({
      ...formData,
      text_answers: formData.text_answers.filter((_, i) => i !== index),
    });
  };

  const updateTextAnswer = (index, field, value) => {
    const newTextAnswers = [...formData.text_answers];
    newTextAnswers[index][field] = value;
    setFormData({ ...formData, text_answers: newTextAnswers });
  };

  return (
    <div className="form-container">
      <h2>Редактировать вопрос</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Текст вопроса *</label>
          <textarea
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            required
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Тип вопроса</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <option value="single">Один вариант</option>
            <option value="multiple">Несколько вариантов</option>
            <option value="text">Текстовый ответ</option>
          </select>
        </div>

        <div className="form-group">
          <label>Пояснение (необязательно)</label>
          <textarea
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            rows={2}
            placeholder="Объяснение правильного ответа"
          />
        </div>

        {formData.type !== 'text' ? (
          <div className="form-group">
            <label>Варианты ответов</label>
            <div className="options-editor">
              {formData.options.map((option, index) => (
                <div key={index} className="option-row">
                  <input
                    type="checkbox"
                    checked={option.is_correct}
                    onChange={(e) => updateOption(index, 'is_correct', e.target.checked)}
                    title="Правильный ответ"
                  />
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => updateOption(index, 'text', e.target.value)}
                    placeholder={`Вариант ${index + 1}`}
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeOption(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-small" onClick={addOption}>
                + Добавить вариант
              </button>
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label>Правильные ответы (шаблоны)</label>
            <div className="text-answers-editor">
              {formData.text_answers.map((ta, index) => (
                <div key={index} className="text-answer-row">
                  <select
                    value={ta.matcher_type}
                    onChange={(e) => updateTextAnswer(index, 'matcher_type', e.target.value)}
                  >
                    <option value="equals">Точное совпадение</option>
                    <option value="contains">Содержит</option>
                    <option value="icontains">Содержит (без учёта регистра)</option>
                  </select>
                  <input
                    type="text"
                    value={ta.value}
                    onChange={(e) => updateTextAnswer(index, 'value', e.target.value)}
                    placeholder="Текст ответа"
                  />
                  {formData.text_answers.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeTextAnswer(index)}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-small" onClick={addTextAnswer}>
                + Добавить шаблон
              </button>
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary">
            Сохранить изменения
          </button>
        </div>
      </form>

      <style>{`
        .options-editor,
        .text-answers-editor {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .option-row,
        .text-answer-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .option-row input[type="checkbox"] {
          width: auto;
          flex-shrink: 0;
        }

        .option-row input[type="text"] {
          flex: 1;
        }

        .text-answer-row select {
          width: 200px;
          flex-shrink: 0;
        }

        .text-answer-row input {
          flex: 1;
        }

        .btn-remove {
          width: 32px;
          height: 32px;
          border: none;
          background: #fee;
          color: #c33;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .btn-remove:hover {
          background: #fcc;
        }
      `}</style>
    </div>
  );
}

function ManageSections({ quiz, questions, onBack }) {
  const [sections, setSections] = useState([]);
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateSection = async (sectionData) => {
    try {
      await api.createSection(quiz.id, sectionData);
      setShowCreateSection(false);
      alert('Секция создана!');
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  return (
    <div className="manage-sections">
      <div className="section-header">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Назад
        </button>
        <h2>Управление секциями: {quiz.title}</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateSection(true)}>
          + Добавить секцию
        </button>
      </div>

      <p className="info-text">
        Секции позволяют организовать вопросы в группы. Можно задать количество случайных вопросов из секции.
      </p>

      {showCreateSection && (
        <CreateSectionForm
          questions={questions}
          onSubmit={handleCreateSection}
          onCancel={() => setShowCreateSection(false)}
        />
      )}

      <style>{`
        .manage-sections {
          padding: 20px;
        }

        .section-header {
          display: flex;
          gap: 20px;
          align-items: center;
          margin-bottom: 20px;
        }

        .section-header h2 {
          flex: 1;
          margin: 0;
          font-size: 24px;
        }

        .info-text {
          background: #f0f7ff;
          padding: 15px;
          border-radius: 6px;
          color: #0066cc;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}

function CreateSectionForm({ questions, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order_index: 0,
    pick_count: null,
    question_ids: [],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData };
    if (data.pick_count) {
      data.pick_count = parseInt(data.pick_count);
    }
    onSubmit(data);
  };

  const toggleQuestion = (questionId) => {
    setFormData({
      ...formData,
      question_ids: formData.question_ids.includes(questionId)
        ? formData.question_ids.filter((id) => id !== questionId)
        : [...formData.question_ids, questionId],
    });
  };

  return (
    <div className="section-form">
      <h3>Создать секцию</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Название секции *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Описание</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={2}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Порядковый номер</label>
            <input
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
            />
          </div>

          <div className="form-group">
            <label>Кол-во случайных вопросов</label>
            <input
              type="number"
              min="1"
              value={formData.pick_count || ''}
              onChange={(e) => setFormData({ ...formData, pick_count: e.target.value || null })}
              placeholder="Все вопросы"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Выберите вопросы</label>
          <div className="questions-list">
            {questions.map((q) => (
              <label key={q.id} className="question-checkbox">
                <input
                  type="checkbox"
                  checked={formData.question_ids.includes(q.id)}
                  onChange={() => toggleQuestion(q.id)}
                />
                <span className="question-text">{q.text}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Отмена
          </button>
          <button type="submit" className="btn btn-primary">
            Создать секцию
          </button>
        </div>
      </form>

      <style>{`
        .section-form {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .section-form h3 {
          margin: 0 0 20px 0;
          font-size: 18px;
        }

        .questions-list {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .question-checkbox {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 8px;
          border-radius: 4px;
          cursor: pointer;
        }

        .question-checkbox:hover {
          background: #f9f9f9;
        }

        .question-checkbox input {
          margin-top: 3px;
          flex-shrink: 0;
          cursor: pointer;
        }

        .question-text {
          flex: 1;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}

function AssignQuizModal({ quiz, users, tasks, onAssign, onClose }) {
  const [formData, setFormData] = useState({
    assigned_to_user_id: null,
    task_id: null,
    required: true,
    due_at: '',
    max_attempts: null,
    cooldown_hours: 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData };
    if (data.assigned_to_user_id === '') data.assigned_to_user_id = null;
    if (data.task_id === '') data.task_id = null;
    if (data.due_at === '') data.due_at = null;
    if (data.max_attempts) data.max_attempts = parseInt(data.max_attempts);
    data.cooldown_hours = parseInt(data.cooldown_hours);
    onAssign(data);
  };

  const handleOverlayClick = (e) => {
    // НЕ закрываем при клике на overlay
    // if (e.target === e.currentTarget) {
    //   onClose();
    // }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <div className="modal-header">
          <h3>Назначить квиз: {quiz.title}</h3>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Пользователь</label>
            <select
              value={formData.assigned_to_user_id || ''}
              onChange={(e) =>
                setFormData({ ...formData, assigned_to_user_id: e.target.value || null })
              }
            >
              <option value="">Не выбран</option>
              {users.filter(u => u.role === 'employee').map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.username})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Связать с задачей</label>
            <select
              value={formData.task_id || ''}
              onChange={(e) => setFormData({ ...formData, task_id: e.target.value || null })}
            >
              <option value="">Не выбрана</option>
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={formData.required}
                onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
              />
              <span>Обязательный</span>
            </label>
          </div>

          <div className="form-group">
            <label>Срок выполнения</label>
            <input
              type="datetime-local"
              value={formData.due_at}
              onChange={(e) => setFormData({ ...formData, due_at: e.target.value })}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Макс. попыток</label>
              <input
                type="number"
                min="1"
                value={formData.max_attempts || ''}
                onChange={(e) => setFormData({ ...formData, max_attempts: e.target.value || null })}
                placeholder="Без ограничения"
              />
            </div>

            <div className="form-group">
              <label>Cooldown (часы)</label>
              <input
                type="number"
                min="0"
                value={formData.cooldown_hours}
                onChange={(e) => setFormData({ ...formData, cooldown_hours: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary">
              Назначить
            </button>
          </div>
        </form>

        <style>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
          }

          .modal {
            background: white;
            border-radius: 8px;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            border-bottom: 1px solid #ddd;
          }

          .modal-header h3 {
            margin: 0;
            font-size: 20px;
          }

          .btn-close {
            width: 32px;
            height: 32px;
            border: none;
            background: #f0f0f0;
            border-radius: 50%;
            cursor: pointer;
            font-size: 18px;
            color: #666;
            transition: all 0.2s;
          }

          .btn-close:hover {
            background: #e0e0e0;
          }

          .modal form {
            padding: 20px;
          }

          .modal-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
            justify-content: flex-end;
          }
        `}</style>
      </div>
    </div>
  );
}

export default QuizManager;

