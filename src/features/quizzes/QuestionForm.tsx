import { Link } from 'react-router-dom';
import { Input, Textarea, Select, Button, Badge } from '@/shared/ui';
import { useQuestionForm } from '@/shared/lib/hooks/useQuestionForm';
import type { Question, QuestionType } from '@/shared/api/types';

interface QuestionFormProps {
  question?: Question;
  questions: Question[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export function QuestionForm({ question, questions, onSubmit, onCancel, isLoading }: QuestionFormProps) {
  const {
    formData,
    setType,
    setText,
    setExplanation,
    addOption,
    removeOption,
    updateOption,
    setCorrectOption,
    addTextAnswer,
    removeTextAnswer,
    updateTextAnswer,
    setData,
  } = useQuestionForm(
    question ? {
      text: question.text,
      type: question.type,
      explanation: question.explanation || '',
      options: question.options || [],
      text_answers: question.text_answers || [],
    } : undefined
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Тип вопроса"
        value={formData.type}
        onChange={(e) => setType(e.target.value as QuestionType)}
        required
        options={[
          { value: 'single', label: 'Одиночный выбор' },
          { value: 'multiple', label: 'Множественный выбор' },
          { value: 'text', label: 'Текстовый ответ' },
        ]}
      />

      <Textarea
        label="Текст вопроса"
        value={formData.text}
        onChange={(e) => setText(e.target.value)}
        required
        placeholder="Введите текст вопроса"
        rows={3}
      />

      <Textarea
        label="Объяснение (необязательно)"
        value={formData.explanation || ''}
        onChange={(e) => setExplanation(e.target.value)}
        placeholder="Объясните правильный ответ"
        rows={2}
      />

      {/* Варианты ответов */}
      {(formData.type === 'single' || formData.type === 'multiple') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Варианты ответов
            </label>
            <Button type="button" variant="secondary" size="sm" onClick={addOption}>
              Добавить вариант
            </Button>
          </div>
          
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type={formData.type === 'single' ? 'radio' : 'checkbox'}
                name={formData.type === 'single' ? 'correct-option' : undefined}
                checked={option.is_correct}
                onChange={(e) => {
                  if (formData.type === 'single') {
                    setCorrectOption(index);
                  } else {
                    updateOption(index, 'is_correct', e.target.checked);
                  }
                }}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <Input
                type="text"
                value={option.text}
                onChange={(e) => updateOption(index, 'text', e.target.value)}
                placeholder={`Вариант ${index + 1}`}
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeOption(index)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          ))}
          
          {formData.options.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              Нет вариантов. Добавьте хотя бы один.
            </p>
          )}
        </div>
      )}

      {/* Текстовые ответы */}
      {formData.type === 'text' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Правильные ответы
            </label>
            <Button type="button" variant="secondary" size="sm" onClick={addTextAnswer}>
              Добавить ответ
            </Button>
          </div>
          
          {formData.text_answers.map((answer, index) => (
            <div key={index} className="flex items-center gap-2">
              <Select
                value={answer.matcher_type}
                onChange={(e) => updateTextAnswer(index, 'matcher_type', e.target.value)}
                className="w-40"
                options={[
                  { value: 'equals', label: 'Точно' },
                  { value: 'contains', label: 'Содержит' },
                  { value: 'icontains', label: 'Содержит (игнорируя регистр)' },
                ]}
              />
              <Input
                type="text"
                value={answer.value}
                onChange={(e) => updateTextAnswer(index, 'value', e.target.value)}
                placeholder="Правильный ответ"
                required
                className="flex-1"
              />
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => removeTextAnswer(index)}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          ))}
          
          {formData.text_answers.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-2">
              Нет правильных ответов. Добавьте хотя бы один.
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {question ? 'Сохранить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
}
