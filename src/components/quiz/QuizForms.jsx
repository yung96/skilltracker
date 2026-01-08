import { useState } from 'react';

export function CreateQuizForm({ onSubmit, onCancel }) {
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
    </div>
  );
}

export function EditQuizForm({ quiz, onSubmit, onCancel }) {
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
    </div>
  );
}

