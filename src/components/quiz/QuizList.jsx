import { useState } from 'react';
import AssignQuizModal from './AssignQuizModal';

function QuizList({
  quizzes,
  questions,
  onCreateQuiz,
  onCreateQuestion,
  onViewQuestions,
  onEditQuiz,
  onDeleteQuiz,
  onManageSections,
  users,
  tasks,
  onRefresh,
  onAssign,
}) {
  const [showAssignModal, setShowAssignModal] = useState(null);

  const handleAssign = async (quizId, assignmentData) => {
    try {
      await onAssign(quizId, assignmentData);
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
              <span className={`status-badge ${quiz.status}`}>
                {quiz.status === 'draft' ? 'Черновик' : 'Опубликован'}
              </span>
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
    </div>
  );
}

export default QuizList;

