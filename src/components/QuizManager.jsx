import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import QuizList from './quiz/QuizList';
import { QuestionsList, CreateQuestionForm, EditQuestionForm } from './quiz/QuestionsList';
import { CreateQuizForm, EditQuizForm } from './quiz/QuizForms';
import ManageSections from './quiz/ManageSections';
import '../styles/quiz.css';

function QuizManager() {
  const [view, setView] = useState('list');
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [quizzesData, questionsData, usersData, tasksData] = await Promise.all([
        api.getQuizzes(),
        api.getQuestions(),
        api.getUsers(),
        api.getTasks(),
      ]);
      setQuizzes(quizzesData);
      setQuestions(questionsData);
      setUsers(usersData);
      setTasks(tasksData);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateQuiz = async (quizData) => {
    try {
      await api.createQuiz(quizData);
      await loadData();
      setView('list');
    } catch (err) {
      alert('Ошибка создания квиза: ' + err.message);
    }
  };

  const handleUpdateQuiz = async (quizId, quizData) => {
    try {
      await api.updateQuiz(quizId, quizData);
      await loadData();
      setView('list');
      setSelectedQuiz(null);
    } catch (err) {
      alert('Ошибка обновления квиза: ' + err.message);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (!confirm('Вы уверены, что хотите удалить этот квиз?')) return;
    try {
      await api.deleteQuiz(quizId);
      await loadData();
    } catch (err) {
      alert('Ошибка удаления квиза: ' + err.message);
    }
  };

  const handleCreateQuestion = async (questionData) => {
    try {
      await api.createQuestion(questionData);
      await loadData();
      setView('questions-list');
    } catch (err) {
      alert('Ошибка создания вопроса: ' + err.message);
    }
  };

  const handleUpdateQuestion = async (questionId, questionData) => {
    try {
      await api.updateQuestion(questionId, questionData);
      await loadData();
      setView('questions-list');
      setSelectedQuestion(null);
    } catch (err) {
      alert('Ошибка обновления вопроса: ' + err.message);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Вы уверены, что хотите удалить этот вопрос?')) return;
    try {
      await api.deleteQuestion(questionId);
      await loadData();
    } catch (err) {
      alert('Ошибка удаления вопроса: ' + err.message);
    }
  };

  const handleAssignQuiz = async (quizId, assignmentData) => {
    await api.assignQuiz(quizId, assignmentData);
    await loadData();
  };

  if (loading && quizzes.length === 0) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="quiz-manager">
      {errorMessage && (
        <div className="error-message" style={{ marginBottom: '12px' }}>
          {errorMessage}
        </div>
      )}

      {view === 'list' && (
        <QuizList
          quizzes={quizzes}
          questions={questions}
          onCreateQuiz={() => setView('create-quiz')}
          onCreateQuestion={() => setView('create-question')}
          onViewQuestions={() => setView('questions-list')}
          onEditQuiz={(quiz) => {
            setSelectedQuiz(quiz);
            setView('edit-quiz');
          }}
          onDeleteQuiz={handleDeleteQuiz}
          onManageSections={(quiz) => {
            setSelectedQuiz(quiz);
            setView('manage-sections');
          }}
          users={users}
          tasks={tasks}
          onRefresh={loadData}
          onAssign={handleAssignQuiz}
        />
      )}

      {view === 'questions-list' && (
        <QuestionsList
          questions={questions}
          onBack={() => setView('list')}
          onCreate={() => setView('create-question')}
          onEdit={(question) => {
            setSelectedQuestion(question);
            setView('edit-question');
          }}
          onDelete={handleDeleteQuestion}
        />
      )}

      {view === 'create-quiz' && (
        <CreateQuizForm onSubmit={handleCreateQuiz} onCancel={() => setView('list')} />
      )}

      {view === 'edit-quiz' && selectedQuiz && (
        <EditQuizForm
          quiz={selectedQuiz}
          onSubmit={(data) => handleUpdateQuiz(selectedQuiz.id, data)}
          onCancel={() => {
            setView('list');
            setSelectedQuiz(null);
          }}
        />
      )}

      {view === 'create-question' && (
        <CreateQuestionForm onSubmit={handleCreateQuestion} onCancel={() => setView('questions-list')} />
      )}

      {view === 'edit-question' && selectedQuestion && (
        <EditQuestionForm
          question={selectedQuestion}
          onSubmit={(data) => handleUpdateQuestion(selectedQuestion.id, data)}
          onCancel={() => {
            setView('questions-list');
            setSelectedQuestion(null);
          }}
        />
      )}

      {view === 'manage-sections' && selectedQuiz && (
        <ManageSections
          quiz={selectedQuiz}
          questions={questions}
          onBack={() => {
            setView('list');
            setSelectedQuiz(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}

export default QuizManager;
 