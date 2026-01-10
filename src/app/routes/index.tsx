import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '@/entities/user/model/store';
import { MainLayout } from '@/app/providers/MainLayout';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { TasksPage } from '@/pages/TasksPage';
import { TaskCreatePage } from '@/pages/TaskCreatePage';
import { TaskDetailPage } from '@/pages/TaskDetailPage';
import { UsersPage } from '@/pages/UsersPage';
import { QuizzesPage } from '@/pages/QuizzesPage';
import { QuizDetailPage } from '@/pages/QuizDetailPage';
import { QuestionsPage } from '@/pages/QuestionsPage';
import { MyAssignmentsPage } from '@/pages/MyAssignmentsPage';
import { AttemptPage } from '@/pages/AttemptPage';
import { AttemptResultPage } from '@/pages/AttemptResultPage';
import { AssignmentAttemptsPage } from '@/pages/AssignmentAttemptsPage';
import { Loader } from '@/shared/ui';
import { ROUTES } from '@/shared/config/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireManager?: boolean;
}

function ProtectedRoute({ children, requireManager = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requireManager && user?.role !== 'manager') {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}

export function AppRoutes() {
  const { getCurrentUser } = useAuthStore();

  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Публичные роуты */}
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        {/* Защищённые роуты */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
                  <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
                  
                  {/* Задачи */}
                  <Route path={ROUTES.TASKS} element={<TasksPage />} />
                  <Route
                    path="/tasks/new"
                    element={
                      <ProtectedRoute requireManager>
                        <TaskCreatePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/tasks/:id" element={<TaskDetailPage />} />
                  
                  {/* Пользователи */}
                  <Route
                    path={ROUTES.USERS}
                    element={
                      <ProtectedRoute requireManager>
                        <UsersPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Тесты */}
                  <Route
                    path={ROUTES.QUIZZES}
                    element={
                      <ProtectedRoute requireManager>
                        <QuizzesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/quizzes/:id"
                    element={
                      <ProtectedRoute requireManager>
                        <QuizDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/questions"
                    element={
                      <ProtectedRoute requireManager>
                        <QuestionsPage />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Мои тесты */}
                  <Route path={ROUTES.MY_ASSIGNMENTS} element={<MyAssignmentsPage />} />
                  <Route path="/attempt" element={<AttemptPage />} />
                  <Route path="/attempt-result/:id" element={<AttemptResultPage />} />
                  
                  {/* Попытки по назначению (для менеджеров) */}
                  <Route
                    path="/assignment-attempts/:assignmentId"
                    element={
                      <ProtectedRoute requireManager>
                        <AssignmentAttemptsPage />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
