import { useState, useEffect } from 'react';
import { useQuizStore } from '../store/quizStore';

function QuizResults({ attempt, onClose }) {
  const { getAttempt } = useQuizStore();
  const [detailedAttempt, setDetailedAttempt] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (attempt && attempt.id) {
      loadDetailedAttempt();
    }
  }, [attempt]);

  const loadDetailedAttempt = async () => {
    setLoading(true);
    try {
      const detailed = await getAttempt(attempt.id);
      setDetailedAttempt(detailed);
    } catch (error) {
      console.error('Failed to load detailed attempt:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const getDuration = (started, finished) => {
    if (!started || !finished) return '-';
    const diff = new Date(finished) - new Date(started);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="quiz-results">
        <div className="loading">Загрузка результатов...</div>
      </div>
    );
  }

  const currentAttempt = detailedAttempt || attempt;
  const isPassed = currentAttempt.passed;
  const score = currentAttempt.score_percent || 0;

  return (
    <div className="quiz-results">
      <div className="results-header">
        <h2>Результаты квиза</h2>
        <button className="btn btn-secondary btn-small" onClick={onClose}>
          Закрыть
        </button>
      </div>

      <div className="results-summary">
        <div className={`score-card ${isPassed ? 'passed' : 'failed'}`}>
          <div className="score-circle">
            <svg viewBox="0 0 100 100" className="score-svg">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#eee"
                strokeWidth="10"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={isPassed ? '#4caf50' : '#d63031'}
                strokeWidth="10"
                strokeDasharray={`${score * 2.827} 282.7`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="score-text">
              <div className="score-value">{Math.round(score)}%</div>
              <div className="score-label">Результат</div>
            </div>
          </div>
          <div className="status-badge">
            {isPassed ? (
              <span className="badge badge-success">✓ Пройден</span>
            ) : (
              <span className="badge badge-danger">✗ Не пройден</span>
            )}
          </div>
        </div>

        <div className="results-info">
          <div className="info-item">
            <span className="label">Статус:</span>
            <span className="value">{currentAttempt.status === 'completed' ? 'Завершён' : 'В процессе'}</span>
          </div>
          <div className="info-item">
            <span className="label">Начало:</span>
            <span className="value">{formatDate(currentAttempt.started_at)}</span>
          </div>
          <div className="info-item">
            <span className="label">Окончание:</span>
            <span className="value">{formatDate(currentAttempt.finished_at)}</span>
          </div>
          <div className="info-item">
            <span className="label">Время:</span>
            <span className="value">{getDuration(currentAttempt.started_at, currentAttempt.finished_at)}</span>
          </div>
        </div>
      </div>

      {detailedAttempt && detailedAttempt.answers && detailedAttempt.answers.length > 0 && (
        <div className="answers-review">
          <h3>Обзор ответов</h3>
          <div className="answers-list">
            {detailedAttempt.answers.map((answer, index) => (
              <div
                key={answer.attempt_question_id}
                className={`answer-item ${
                  answer.is_correct === true
                    ? 'correct'
                    : answer.is_correct === false
                    ? 'incorrect'
                    : 'unknown'
                }`}
              >
                <div className="answer-header">
                  <span className="answer-number">Вопрос {index + 1}</span>
                  {answer.is_correct === true && (
                    <span className="answer-status correct">✓ Верно</span>
                  )}
                  {answer.is_correct === false && (
                    <span className="answer-status incorrect">✗ Неверно</span>
                  )}
                </div>
                <div className="answer-content">
                  {answer.text_answer ? (
                    <div className="text-answer-display">
                      <strong>Ваш ответ:</strong>
                      <p>{answer.text_answer}</p>
                    </div>
                  ) : answer.selected_option_ids && answer.selected_option_ids.length > 0 ? (
                    <div>
                      <strong>Выбрано вариантов:</strong> {answer.selected_option_ids.length}
                    </div>
                  ) : (
                    <div className="no-answer">Нет ответа</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!detailedAttempt || !detailedAttempt.answers || detailedAttempt.answers.length === 0 && (
        <div className="no-review">
          <p>Детальный обзор ответов недоступен для этого квиза.</p>
        </div>
      )}

      <style>{`
        .quiz-results {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        }

        .results-header h2 {
          margin: 0;
          font-size: 24px;
        }

        .results-summary {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 30px;
          margin-bottom: 40px;
        }

        @media (max-width: 768px) {
          .results-summary {
            grid-template-columns: 1fr;
          }
        }

        .score-card {
          background: white;
          border: 2px solid #ddd;
          border-radius: 12px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .score-card.passed {
          border-color: #4caf50;
          background: linear-gradient(135deg, #ffffff 0%, #f1f8f4 100%);
        }

        .score-card.failed {
          border-color: #d63031;
          background: linear-gradient(135deg, #ffffff 0%, #fef1f1 100%);
        }

        .score-circle {
          position: relative;
          width: 180px;
          height: 180px;
        }

        .score-svg {
          width: 100%;
          height: 100%;
          transform: rotate(0deg);
        }

        .score-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .score-value {
          font-size: 48px;
          font-weight: bold;
          line-height: 1;
        }

        .score-label {
          font-size: 14px;
          color: #666;
          margin-top: 5px;
        }

        .status-badge {
          text-align: center;
        }

        .badge {
          padding: 8px 20px;
          border-radius: 20px;
          font-size: 16px;
          font-weight: 500;
        }

        .badge-success {
          background: #4caf50;
          color: white;
        }

        .badge-danger {
          background: #d63031;
          color: white;
        }

        .results-info {
          background: white;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-item .label {
          color: #666;
          font-weight: 500;
        }

        .info-item .value {
          font-weight: 500;
        }

        .answers-review {
          background: white;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 30px;
        }

        .answers-review h3 {
          margin: 0 0 20px 0;
          font-size: 20px;
        }

        .answers-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .answer-item {
          border: 2px solid #ddd;
          border-radius: 8px;
          padding: 15px;
        }

        .answer-item.correct {
          border-color: #4caf50;
          background: #f1f8f4;
        }

        .answer-item.incorrect {
          border-color: #d63031;
          background: #fef1f1;
        }

        .answer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .answer-number {
          font-weight: 600;
        }

        .answer-status {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
        }

        .answer-status.correct {
          background: #4caf50;
          color: white;
        }

        .answer-status.incorrect {
          background: #d63031;
          color: white;
        }

        .answer-content {
          font-size: 14px;
          color: #666;
        }

        .text-answer-display strong {
          display: block;
          margin-bottom: 8px;
          color: #333;
        }

        .text-answer-display p {
          margin: 0;
          padding: 10px;
          background: white;
          border-radius: 6px;
          border: 1px solid #ddd;
        }

        .no-answer {
          color: #999;
          font-style: italic;
        }

        .no-review {
          text-align: center;
          padding: 40px;
          color: #666;
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

        .btn-small {
          padding: 8px 16px;
          font-size: 13px;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
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

export default QuizResults;

