import { useEffect, useState } from 'react';
import { api } from '../../api';

function ManageSections({ quiz, questions, onBack }) {
  const [sections, setSections] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editSectionData, setEditSectionData] = useState(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [editAssignmentData, setEditAssignmentData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadSectionsAndAssignments = async () => {
    setLoading(true);
    try {
      const [sectionsData, assignmentsData] = await Promise.all([
        api.getSections(quiz.id),
        api.getQuizAssignments(quiz.id),
      ]);
      setSections(sectionsData);
      setAssignments(assignmentsData);
    } catch (err) {
      alert('Ошибка загрузки секций/назначений: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSectionsAndAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz.id]);

  const handleCreateSection = async (sectionData) => {
    try {
      await api.createSection(quiz.id, sectionData);
      setShowCreateSection(false);
      await loadSectionsAndAssignments();
      alert('Секция создана!');
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const startEditSection = (section) => {
    setEditingSectionId(section.id);
    setEditSectionData({
      title: section.title || '',
      description: section.description || '',
      order_index: section.order_index ?? 0,
      pick_count: section.pick_count ?? null,
      question_ids: (section.questions || []).map((q) => q.id),
    });
  };

  const cancelEditSection = () => {
    setEditingSectionId(null);
    setEditSectionData(null);
  };

  const saveSection = async () => {
    if (!editingSectionId || !editSectionData) return;
    try {
      setLoading(true);
      const payload = { ...editSectionData };
      if (payload.pick_count) payload.pick_count = parseInt(payload.pick_count);
      await api.updateSection(quiz.id, editingSectionId, payload);
      cancelEditSection();
      await loadSectionsAndAssignments();
    } catch (err) {
      alert('Ошибка сохранения секции: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteSection = async (section) => {
    if (!confirm(`Удалить секцию "${section.title}"?`)) return;
    try {
      setLoading(true);
      await api.deleteSection(quiz.id, section.id);
      if (editingSectionId === section.id) cancelEditSection();
      await loadSectionsAndAssignments();
    } catch (err) {
      alert('Ошибка удаления секции: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditAssignment = (a) => {
    setEditingAssignmentId(a.id);
    setEditAssignmentData({
      required: !!a.required,
      due_at: a.due_at ? new Date(a.due_at).toISOString().slice(0, 16) : '',
      max_attempts: a.max_attempts ?? null,
      cooldown_hours: a.cooldown_hours ?? 0,
    });
  };

  const cancelEditAssignment = () => {
    setEditingAssignmentId(null);
    setEditAssignmentData(null);
  };

  const saveAssignment = async () => {
    if (!editingAssignmentId || !editAssignmentData) return;
    try {
      setLoading(true);
      const payload = { ...editAssignmentData };
      if (payload.due_at === '') payload.due_at = null;
      if (payload.max_attempts) payload.max_attempts = parseInt(payload.max_attempts);
      payload.cooldown_hours = parseInt(payload.cooldown_hours);
      await api.updateAssignment(editingAssignmentId, payload);
      cancelEditAssignment();
      await loadSectionsAndAssignments();
    } catch (err) {
      alert('Ошибка обновления назначения: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (a) => {
    if (!confirm('Удалить назначение?')) return;
    try {
      setLoading(true);
      await api.deleteAssignment(a.id);
      if (editingAssignmentId === a.id) cancelEditAssignment();
      await loadSectionsAndAssignments();
    } catch (err) {
      alert('Ошибка удаления назначения: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manage-sections">
      <div className="section-header">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Назад
        </button>
        <h2>Управление секциями: {quiz.title}</h2>
        <button className="btn btn-primary" onClick={() => setShowCreateSection(true)} disabled={loading}>
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

      <div className="section-toolbar">
        <h3 className="m-0">Секции ({sections.length})</h3>
        <button className="btn btn-secondary" onClick={loadSectionsAndAssignments} disabled={loading}>
          🔄 Обновить
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="card card-muted padded-16">Секций пока нет — добавьте первую.</div>
      ) : (
        <div className="section-list">
          {sections.map((s) => (
            <div key={s.id} className="card padded-16">
              <div className="section-row">
                <div className="section-info">
                  <div className="section-title-row">
                    <strong>{s.title}</strong>
                    <span className="section-meta">
                      order: {s.order_index} {s.pick_count ? `• pick: ${s.pick_count}` : ''}
                    </span>
                  </div>
                  {s.description && <div className="section-desc">{s.description}</div>}
                  <div className="section-submeta">Вопросов: {(s.questions || []).length}</div>
                </div>

                <div className="section-actions">
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => startEditSection(s)}
                    disabled={loading}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => deleteSection(s)}
                    disabled={loading}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {editingSectionId === s.id && editSectionData && (
                <div className="section-edit-area">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Название</label>
                      <input
                        type="text"
                        value={editSectionData.title}
                        onChange={(e) => setEditSectionData({ ...editSectionData, title: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Порядок</label>
                      <input
                        type="number"
                        value={editSectionData.order_index}
                        onChange={(e) =>
                          setEditSectionData({ ...editSectionData, order_index: parseInt(e.target.value) })
                        }
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Pick count</label>
                      <input
                        type="number"
                        min="1"
                        value={editSectionData.pick_count || ''}
                        onChange={(e) => setEditSectionData({ ...editSectionData, pick_count: e.target.value || null })}
                        disabled={loading}
                        placeholder="Все"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Описание</label>
                    <textarea
                      value={editSectionData.description}
                      onChange={(e) => setEditSectionData({ ...editSectionData, description: e.target.value })}
                      rows={2}
                      disabled={loading}
                    />
                  </div>

                  <div className="form-group">
                    <label>Вопросы</label>
                    <div className="questions-list condensed">
                      {questions.map((q) => (
                        <label key={q.id} className="question-checkbox">
                          <input
                            type="checkbox"
                            checked={editSectionData.question_ids.includes(q.id)}
                            onChange={() => {
                              const exists = editSectionData.question_ids.includes(q.id);
                              setEditSectionData({
                                ...editSectionData,
                                question_ids: exists
                                  ? editSectionData.question_ids.filter((id) => id !== q.id)
                                  : [...editSectionData.question_ids, q.id],
                              });
                            }}
                            disabled={loading}
                          />
                          <span className="question-text">{q.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-actions justify-end">
                    <button type="button" className="btn btn-secondary" onClick={cancelEditSection} disabled={loading}>
                      Отмена
                    </button>
                    <button type="button" className="btn btn-primary" onClick={saveSection} disabled={loading}>
                      Сохранить
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="section-toolbar">
        <h3 className="m-0">Назначения ({assignments.length})</h3>
      </div>

      {assignments.length === 0 ? (
        <div className="card card-muted padded-16">
          Назначений пока нет — нажмите “Назначить” в списке квизов.
        </div>
      ) : (
        <div className="section-list">
          {assignments.map((a) => (
            <div key={a.id} className="card padded-16">
              <div className="assignment-row">
                <div className="section-info">
                  <div className="section-title-row wrap">
                    <strong>#{a.id}</strong>
                    <span className="assignment-meta">
                      target: {a.assigned_to_user_id ? `user ${a.assigned_to_user_id}` : a.task_id ? `task ${a.task_id}` : '—'}
                    </span>
                    <span className="assignment-meta">required: {a.required ? 'да' : 'нет'}</span>
                    {a.due_at && <span className="assignment-meta">due: {new Date(a.due_at).toLocaleString('ru-RU')}</span>}
                  </div>
                  <div className="section-submeta">
                    attempts: {a.attempts_taken ?? 0}
                    {a.remaining_attempts !== null && a.remaining_attempts !== undefined ? ` • remaining: ${a.remaining_attempts}` : ''}
                    {a.cooldown_hours ? ` • cooldown: ${a.cooldown_hours}h` : ''}
                    {a.max_attempts ? ` • max: ${a.max_attempts}` : ''}
                  </div>
                </div>

                <div className="assignment-actions">
                  <button
                    className="btn btn-secondary btn-small"
                    onClick={() => startEditAssignment(a)}
                    disabled={loading}
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-danger btn-small"
                    onClick={() => deleteAssignment(a)}
                    disabled={loading}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {editingAssignmentId === a.id && editAssignmentData && (
                <div className="assignment-edit-area">
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={editAssignmentData.required}
                        onChange={(e) => setEditAssignmentData({ ...editAssignmentData, required: e.target.checked })}
                        disabled={loading}
                      />
                      <span>Обязательный</span>
                    </label>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Срок</label>
                      <input
                        type="datetime-local"
                        value={editAssignmentData.due_at}
                        onChange={(e) => setEditAssignmentData({ ...editAssignmentData, due_at: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                    <div className="form-group">
                      <label>Макс. попыток</label>
                      <input
                        type="number"
                        min="1"
                        value={editAssignmentData.max_attempts || ''}
                        onChange={(e) =>
                          setEditAssignmentData({ ...editAssignmentData, max_attempts: e.target.value || null })
                        }
                        disabled={loading}
                        placeholder="По умолчанию"
                      />
                    </div>
                    <div className="form-group">
                      <label>Cooldown (часы)</label>
                      <input
                        type="number"
                        min="0"
                        value={editAssignmentData.cooldown_hours}
                        onChange={(e) => setEditAssignmentData({ ...editAssignmentData, cooldown_hours: e.target.value })}
                        disabled={loading}
                      />
                    </div>
                  </div>
                  <div className="form-actions justify-end">
                    <button type="button" className="btn btn-secondary" onClick={cancelEditAssignment} disabled={loading}>
                      Отмена
                    </button>
                    <button type="button" className="btn btn-primary" onClick={saveAssignment} disabled={loading}>
                      Сохранить
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
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

        .card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
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
    setFormData((prev) => ({
      ...prev,
      question_ids: prev.question_ids.includes(questionId)
        ? prev.question_ids.filter((id) => id !== questionId)
        : [...prev.question_ids, questionId],
    }));
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

export default ManageSections;

