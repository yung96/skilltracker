import { useState } from 'react';
import type { QuestionCreate, QuestionType } from '@/shared/api/types';

type QuestionFormData = Omit<QuestionCreate, 'options' | 'text_answers'> & {
  options: NonNullable<QuestionCreate['options']>;
  text_answers: NonNullable<QuestionCreate['text_answers']>;
};

export function useQuestionForm(initialData?: QuestionCreate) {
  const [formData, setFormData] = useState<QuestionFormData>(() => {
    const base = initialData ?? { text: '', type: 'single', explanation: '' };
    return {
      ...base,
      options: base.options ?? [],
      text_answers: base.text_answers ?? [],
    };
  });

  const setType = (type: QuestionType) => {
    setFormData({ ...formData, type });
  };

  const setText = (text: string) => {
    setFormData({ ...formData, text });
  };

  const setExplanation = (explanation: string) => {
    setFormData({ ...formData, explanation });
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, { text: '', is_correct: false }],
    });
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const updateOption = (index: number, field: 'text' | 'is_correct', value: string | boolean) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const setCorrectOption = (index: number) => {
    // Для single choice - только один правильный
    const newOptions = formData.options.map((opt, i) => ({
      ...opt,
      is_correct: i === index,
    }));
    setFormData({ ...formData, options: newOptions });
  };

  const addTextAnswer = () => {
    setFormData({
      ...formData,
      text_answers: [...formData.text_answers, { matcher_type: 'equals', value: '' }],
    });
  };

  const removeTextAnswer = (index: number) => {
    setFormData({
      ...formData,
      text_answers: formData.text_answers.filter((_, i) => i !== index),
    });
  };

  const updateTextAnswer = (index: number, field: 'matcher_type' | 'value', value: string) => {
    const newAnswers = [...formData.text_answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setFormData({ ...formData, text_answers: newAnswers });
  };

  const reset = () => {
    setFormData({
      text: '',
      type: 'single',
      explanation: '',
      options: [],
      text_answers: [],
    });
  };

  const setData = (data: QuestionCreate) => {
    setFormData({
      ...data,
      options: data.options ?? [],
      text_answers: data.text_answers ?? [],
    });
  };

  return {
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
    reset,
    setData,
  };
}
