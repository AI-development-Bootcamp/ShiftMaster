import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import './styles/reset.css';
import './styles/global.css';
import './styles/App.css';
import { RightSidebarTaskbar } from './components/RightSidebarTaskbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { getNavigationItems } from './config/navigation';
import { LoginPage } from './pages/LoginPage';
import { AssignmentPage } from './pages/AssignmentPage';
import { EntriesManagementPage } from './pages/EntriesManagementPage';
import { EmployeesManagementPage } from './pages/EmployeesManagementPage';
import { mockCurrentUser } from './mocks/users';
import { DesktopOnlyOverlay } from './components/DesktopOnlyOverlay/DesktopOnlyOverlay';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { initializeAuth } from './store/slices/authSlice';

/**
 * Login route wrapper
 * Redirects to /assignment if already authenticated
 */
function LoginRoute() {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return null; // Don't redirect while checking auth
  }

  if (isAuthenticated) {
    return <Navigate to="/assignment" replace />;
  }

  return <LoginPage />;
}

function AppContent() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Initialize auth on app startup (check for refresh token)
    dispatch(initializeAuth())
      .unwrap()
      .catch((error) => {
        const errorCode =
          (error as { code?: string })?.code ?? 'AUTH_INIT_FAILED';
        console.error('Auth init error:', { code: errorCode, error });
      });
  }, [dispatch]);

  const isLoginPage = location.pathname === '/';
  const navigationItems = getNavigationItems(t);

  return (
    <div className="app" dir="rtl">
      {!isLoginPage && isAuthenticated && (
        <RightSidebarTaskbar
          navItems={navigationItems}
          user={mockCurrentUser}
        />
      )}
      <main className={!isLoginPage ? 'main-content' : 'login-content'}>
        <Routes>
          <Route path="/" element={<LoginRoute />} />
          <Route
            path="/assignment"
            element={
              <ProtectedRoute>
                <AssignmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/entries"
            element={
              <ProtectedRoute>
                <EntriesManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <EmployeesManagementPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <DesktopOnlyOverlay />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
