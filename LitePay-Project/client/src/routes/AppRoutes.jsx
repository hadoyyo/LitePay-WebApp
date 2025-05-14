import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../components/common/AppLayout';
import Loader from '../components/common/Loader';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';

const HomePage = lazy(() => import('../pages/Dashboard/HomePage'));
const ProfilePage = lazy(() => import('../pages/Dashboard/ProfilePage'));
const GroupsPage = lazy(() => import('../pages/Groups/GroupsPage'));
const GroupDetailsPage = lazy(() => import('../pages/Groups/GroupDetailsPage'));
const CreateGroupPage = lazy(() => import('../pages/Groups/CreateGroupPage'));
const ExpenseDetailsPage = lazy(() => import('../pages/Expenses/ExpenseDetailsPage'));
const FinancesPage = lazy(() => import('../pages/Finances/FinancesPage'));
const HelpPage = lazy(() => import('../pages/Help/HelpPage'));
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/Auth/RegisterPage'));
const CreateExpensePage = lazy(() => import('../pages/Expenses/CreateExpensePage'));
const NotFoundPage = lazy(() => import('../pages/404/NotFoundPage'));

export default function AppRoutes({ toggleTheme, theme }) {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage toggleTheme={toggleTheme} theme={theme} />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage toggleTheme={toggleTheme} theme={theme} />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout toggleTheme={toggleTheme} theme={theme} />
            </PrivateRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="groups/create" element={<CreateGroupPage />} />
          <Route path="groups/:groupId" element={<GroupDetailsPage />} />
          <Route path="expenses/:expenseId" element={<ExpenseDetailsPage />} />
          <Route path="groups/:groupId/expenses/new" element={<CreateExpensePage />} />
          <Route path="expenses/:expenseId/edit" element={<ExpenseDetailsPage />} />
          <Route path="finances" element={<FinancesPage />} />
          <Route path="help" element={<HelpPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}