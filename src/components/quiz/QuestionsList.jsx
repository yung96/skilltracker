import { useState } from 'react';

export function QuestionsList({ questions, onBack, onCreate, onEdit, onDelete }) {
  return (
    <div className="quiz-list">
      <div className="page-header">
        <h2>Вопросы</h2>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={onCreate}>
            + Создать вопрос
          </button>
          <button className="btn btn-primary" onClick={onBack}>
            ← Назад
          </button>
        </div>
      </div>

      <div className="quizzes-grid">
        {questions.map((question) => (
          <div key={question.id} className="quiz-card">
            <div className="quiz-header">
              <h3>{question.text}</h3>
              <span className="status-badge">{question.type}</span>
            </div>
            <div className="quiz-actions">
              <button className="btn btn-secondary btn-small" onClick={() => onEdit(question)}>
                ✏️ Редактировать
              </button>
              <button className="btn btn-danger btn-small" onClick={() => onDelete(question.id)}>
                🗑️ Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CreateQuestionForm({ onSubmit, onCancel }) {
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
      data.text_answers = data.text_answers.filter((ta) => ta.value.trim());
    } else {
      data.options = data.options.filter((opt) => opt.text.trim());
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
            Создать вопрос
          </button>
        </div>
      </form>
    </div>
  );
}

export function EditQuestionForm({ question, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    text: question.text,
    type: question.type,
    explanation: question.explanation || '',
    options: question.options?.length
      ? question.options.map((o) => ({ text: o.text, is_correct: o.is_correct }))
      : [
          { text: '', is_correct: false },
          { text: '', is_correct: false },
        ],
    text_answers: question.text_answers?.length
      ? question.text_answers.map((ta) => ({ matcher_type: ta.matcher_type, value: ta.value }))
      : [{ matcher_type: 'icontains', value: '' }],
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData };

    if (data.type === 'text') {
      data.options = [];
      data.text_answers = data.text_answers.filter((ta) => ta.value.trim());
    } else {
      data.options = data.options.filter((opt) => opt.text.trim());
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
    </div>
  );
}

