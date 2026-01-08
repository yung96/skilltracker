import { useState } from 'react';

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

  return (
    <div className="modal-overlay">
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
              {users
                .filter((u) => u.role === 'employee')
                .map((user) => (
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
                placeholder="По умолчанию"
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

          <div className="form-actions" style={{ justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="btn btn-primary">
              Назначить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignQuizModal;

