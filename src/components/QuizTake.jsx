import { useState, useEffect, useCallback } from 'react';
import { useQuizStore } from '../store/quizStore';

function QuizTake({ quizId, onComplete, onCancel }) {
  const { startAttempt, submitAttempt, setAnswer, answers, loading, error } = useQuizStore();
  const [attemptData, setAttemptData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const initQuiz = useCallback(async () => {
    try {
      const data = await startAttempt(quizId);
      setAttemptData(data);
      if (data.time_limit_seconds) {
        setTimeRemaining(data.time_limit_seconds);
      }
    } catch (error) {
      console.error('Failed to start quiz:', error);
    }
  }, [quizId, startAttempt]);

  const handleSubmit = useCallback(async () => {
    setShowConfirmSubmit(false);
    try {
      const result = await submitAttempt(attemptData.attempt_id);
      onComplete(result);
    } catch (error) {
      console.error('Failed to submit quiz:', error);
    }
  }, [attemptData, onComplete, submitAttempt]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void initQuiz();
  }, [initQuiz]);

  useEffect(() => {
    if (!attemptData || !attemptData.time_limit_seconds) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - new Date(attemptData.started_at).getTime()) / 1000);
      const remaining = attemptData.time_limit_seconds - elapsed;

      if (remaining <= 0) {
        handleSubmit();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [attemptData, handleSubmit]);

  const handleAnswer = (attemptQuestionId, value, isText = false) => {
    const question = attemptData.questions[currentQuestionIndex];
    
    if (isText) {
      setAnswer(attemptQuestionId, [], value);
    } else if (question.question.type === 'single') {
      setAnswer(attemptQuestionId, [value], null);
    } else if (question.question.type === 'multiple') {
      const currentAnswer = answers[attemptQuestionId] || { selected_option_ids: [] };
      const selectedIds = currentAnswer.selected_option_ids || [];
      const newSelectedIds = selectedIds.includes(value)
        ? selectedIds.filter(id => id !== value)
        : [...selectedIds, value];
      setAnswer(attemptQuestionId, newSelectedIds, null);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    if (!attemptData) return 0;
    const answered = Object.keys(answers).length;
    const total = attemptData.questions.length;
    return Math.floor((answered / total) * 100);
  };

  if (loading && !attemptData) {
    return <div className="quiz-loading">Загрузка квиза...</div>;
  }

  if (error) {
    return (
      <div className="quiz-error">
        <p>Ошибка: {error}</p>
        <button className="btn btn-secondary" onClick={onCancel}>
          Вернуться
        </button>
      </div>
    );
  }

  if (!attemptData) return null;

  const currentQuestion = attemptData.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion.attempt_question_id] || {
    selected_option_ids: [],
    text_answer: '',
  };

  return (
    <div className="quiz-take">
      <div className="quiz-header">
        <div className="quiz-info">
          <h2>Квиз в процессе</h2>
          <div className="quiz-meta">
            <span>
              Вопрос {currentQuestionIndex + 1} из {attemptData.questions.length}
            </span>
            {timeRemaining !== null && (
              <span className={`timer ${timeRemaining < 60 ? 'warning' : ''}`}>
                Осталось: {formatTime(timeRemaining)}
              </span>
            )}
          </div>
        </div>
        <button className="btn btn-secondary btn-small" onClick={onCancel}>
          Отменить
        </button>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${getProgress()}%` }} />
      </div>

      <div className="question-container">
        <div className="question-header">
          <h3>{currentQuestion.question.text}</h3>
          <span className="question-type">
            {currentQuestion.question.type === 'single' && 'Один вариант'}
            {currentQuestion.question.type === 'multiple' && 'Несколько вариантов'}
            {currentQuestion.question.type === 'text' && 'Текстовый ответ'}
          </span>
        </div>

        <div className="question-content">
          {currentQuestion.question.type === 'text' ? (
            <textarea
              className="text-answer"
              value={currentAnswer.text_answer || ''}
              onChange={(e) =>
                handleAnswer(currentQuestion.attempt_question_id, e.target.value, true)
              }
              placeholder="Введите ваш ответ..."
              rows={5}
            />
          ) : (
            <div className="options-list">
              {currentQuestion.question.options.map((option) => {
                const isSelected = currentAnswer.selected_option_ids.includes(option.id);
                return (
                  <label key={option.id} className={`option ${isSelected ? 'selected' : ''}`}>
                    <input
                      type={currentQuestion.question.type === 'single' ? 'radio' : 'checkbox'}
                      checked={isSelected}
                      onChange={() => handleAnswer(currentQuestion.attempt_question_id, option.id)}
                    />
                    <span className="option-text">{option.text}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="quiz-navigation">
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
        >
          ← Предыдущий
        </button>

        <div className="question-indicators">
          {attemptData.questions.map((q, idx) => (
            <button
              key={q.attempt_question_id}
              className={`indicator ${idx === currentQuestionIndex ? 'active' : ''} ${
                answers[q.attempt_question_id] ? 'answered' : ''
              }`}
              onClick={() => setCurrentQuestionIndex(idx)}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentQuestionIndex < attemptData.questions.length - 1 ? (
          <button
            className="btn btn-primary"
            onClick={() =>
              setCurrentQuestionIndex(Math.min(attemptData.questions.length - 1, currentQuestionIndex + 1))
            }
          >
            Следующий →
          </button>
        ) : (
          <button className="btn btn-success" onClick={() => setShowConfirmSubmit(true)}>
            Завершить квиз
          </button>
        )}
      </div>

      {showConfirmSubmit && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Завершить квиз?</h3>
            <p>
              Вы ответили на {Object.keys(answers).length} из {attemptData.questions.length}{' '}
              вопросов.
            </p>
            <p>После отправки вы не сможете изменить ответы.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowConfirmSubmit(false)}>
                Отмена
              </button>
              <button className="btn btn-success" onClick={handleSubmit}>
                Отправить
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .quiz-take {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .quiz-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .quiz-info h2 {
          margin: 0 0 10px 0;
          font-size: 24px;
        }

        .quiz-meta {
          display: flex;
          gap: 20px;
          color: #666;
          font-size: 14px;
        }

        .timer {
          font-weight: 500;
          color: #0066cc;
        }

        .timer.warning {
          color: #d63031;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .progress-bar {
          height: 4px;
          background: #eee;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 30px;
        }

        .progress-fill {
          height: 100%;
          background: #0066cc;
          transition: width 0.3s;
        }

        .question-container {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 30px;
          margin-bottom: 30px;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          gap: 20px;
        }

        .question-header h3 {
          margin: 0;
          font-size: 20px;
          flex: 1;
        }

        .question-type {
          background: #f0f0f0;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 13px;
          color: #666;
          white-space: nowrap;
        }

        .text-answer {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
        }

        .text-answer:focus {
          outline: none;
          border-color: #0066cc;
        }

        .options-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          border: 2px solid #ddd;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .option:hover {
          border-color: #999;
          background: #f9f9f9;
        }

        .option.selected {
          border-color: #0066cc;
          background: #f0f7ff;
        }

        .option input {
          cursor: pointer;
        }

        .option-text {
          flex: 1;
          font-size: 15px;
        }

        .quiz-navigation {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .question-indicators {
          display: flex;
          gap: 8px;
          flex: 1;
          flex-wrap: wrap;
          justify-content: center;
        }

        .indicator {
          width: 36px;
          height: 36px;
          border: 2px solid #ddd;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .indicator:hover {
          border-color: #999;
        }

        .indicator.active {
          border-color: #0066cc;
          background: #0066cc;
          color: white;
        }

        .indicator.answered {
          background: #e8f5e9;
          border-color: #4caf50;
        }

        .indicator.active.answered {
          background: #0066cc;
          border-color: #0066cc;
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

        .btn-primary {
          background: #0066cc;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0052a3;
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .btn-success {
          background: #4caf50;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background: #45a049;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

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
          padding: 30px;
          max-width: 500px;
          width: 90%;
        }

        .modal h3 {
          margin: 0 0 15px 0;
          font-size: 20px;
        }

        .modal p {
          margin: 10px 0;
          color: #666;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          justify-content: flex-end;
        }

        .quiz-loading,
        .quiz-error {
          text-align: center;
          padding: 60px 20px;
        }

        .quiz-error p {
          color: #d63031;
          margin-bottom: 20px;
        }
      `}</style>
    </div>
  );
}

export default QuizTake;

