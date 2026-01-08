import { useState, useEffect } from 'react';
import { useQuizStore } from '../store/quizStore';
import QuizTake from './QuizTake';
import QuizResults from './QuizResults';

function MyQuizAssignments() {
  const { assignments, loading, error, fetchAssignments } = useQuizStore();
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [showResults, setShowResults] = useState(null);
  const [takingQuiz, setTakingQuiz] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getStatusBadge = (assignment) => {
    if (assignment.remaining_attempts === 0) {
      return <span className="badge badge-danger">Попытки исчерпаны</span>;
    }
    if (assignment.due_at && new Date(assignment.due_at) < new Date()) {
      return <span className="badge badge-warning">Просрочено</span>;
    }
    if (assignment.required) {
      return <span className="badge badge-info">Обязательный</span>;
    }
    return null;
  };

  const handleStartQuiz = (quizId) => {
    setSelectedQuizId(quizId);
    setTakingQuiz(true);
  };

  const handleQuizComplete = (result) => {
    setTakingQuiz(false);
    setSelectedQuizId(null);
    setShowResults(result);
    fetchAssignments();
  };

  const handleCancelQuiz = () => {
    setTakingQuiz(false);
    setSelectedQuizId(null);
  };

  const handleCloseResults = () => {
    setShowResults(null);
  };

  if (takingQuiz && selectedQuizId) {
    return (
      <QuizTake
        quizId={selectedQuizId}
        onComplete={handleQuizComplete}
        onCancel={handleCancelQuiz}
      />
    );
  }

  if (showResults) {
    return (
      <QuizResults
        attempt={showResults}
        onClose={handleCloseResults}
      />
    );
  }

  if (loading) {
    return <div className="loading">Загрузка заданий...</div>;
  }

  if (error) {
    return <div className="error">Ошибка: {error}</div>;
  }

  return (
    <div className="quiz-assignments">
      <div className="page-header">
        <h2>Мои задания по квизам</h2>
      </div>

      {assignments.length === 0 ? (
        <div className="empty-state">
          <p>У вас пока нет заданий по квизам</p>
        </div>
      ) : (
        <div className="assignments-grid">
          {assignments.map((item) => (
            <div key={item.assignment.id} className="assignment-card">
              <div className="assignment-header">
                <h3>{item.quiz.title}</h3>
                {getStatusBadge(item.assignment)}
              </div>

              {item.quiz.description && (
                <p className="assignment-description">{item.quiz.description}</p>
              )}

              <div className="assignment-info">
                <div className="info-row">
                  <span className="label">Проходной балл:</span>
                  <span className="value">{item.quiz.pass_percent}%</span>
                </div>

                {item.quiz.time_limit_seconds && (
                  <div className="info-row">
                    <span className="label">Время:</span>
                    <span className="value">
                      {Math.floor(item.quiz.time_limit_seconds / 60)} мин
                    </span>
                  </div>
                )}

                <div className="info-row">
                  <span className="label">Попыток:</span>
                  <span className="value">
                    {item.assignment.attempts_taken} из{' '}
                    {item.assignment.remaining_attempts !== null
                      ? item.assignment.attempts_taken + item.assignment.remaining_attempts
                      : '∞'}
                  </span>
                </div>

                {item.assignment.due_at && (
                  <div className="info-row">
                    <span className="label">Срок:</span>
                    <span className="value">{formatDate(item.assignment.due_at)}</span>
                  </div>
                )}

                {item.task && (
                  <div className="info-row">
                    <span className="label">Связано с задачей:</span>
                    <span className="value">{item.task.title}</span>
                  </div>
                )}
              </div>

              <div className="assignment-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => handleStartQuiz(item.quiz.id)}
                  disabled={item.assignment.remaining_attempts === 0}
                >
                  {item.assignment.attempts_taken === 0
                    ? 'Начать квиз'
                    : 'Пройти снова'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .quiz-assignments {
          padding: 20px;
        }

        .page-header {
          margin-bottom: 30px;
        }

        .page-header h2 {
          margin: 0;
          font-size: 24px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .assignments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .assignment-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .assignment-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .assignment-header h3 {
          margin: 0;
          font-size: 18px;
          flex: 1;
        }

        .badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          white-space: nowrap;
        }

        .badge-danger {
          background: #fee;
          color: #c33;
        }

        .badge-warning {
          background: #ffeaa7;
          color: #d63031;
        }

        .badge-info {
          background: #dfe6e9;
          color: #2d3436;
        }

        .assignment-description {
          color: #666;
          margin: 0;
          font-size: 14px;
        }

        .assignment-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 14px;
        }

        .info-row .label {
          color: #666;
        }

        .info-row .value {
          font-weight: 500;
        }

        .assignment-actions {
          display: flex;
          gap: 10px;
          margin-top: auto;
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

        .btn-primary {
          background: #0066cc;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0052a3;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default MyQuizAssignments;

