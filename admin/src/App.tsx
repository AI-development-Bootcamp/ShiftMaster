import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles/reset.css';
import './styles/global.css';
import './styles/App.css';
import { RightSidebarTaskbar } from './components/RightSidebarTaskbar';
import { getNavigationItems } from './config/navigation';
import { LoginPage } from './pages/LoginPage';
import { AssignmentPage } from './pages/AssignmentPage';
import { EntriesManagementPage } from './pages/EntriesManagementPage';
import { EmployeesManagementPage } from './pages/EmployeesManagementPage';
import { mockCurrentUser } from './mocks/users';
import { DesktopOnlyOverlay } from './components/DesktopOnlyOverlay/DesktopOnlyOverlay';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useAppDispatch } from './store';
import { initializeAuth } from './store/slices/authSlice';

function AppContent() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  const isLoginPage = location.pathname === '/';
  const navigationItems = getNavigationItems(t);

  return (
    <div className="app" dir="rtl">
      {!isLoginPage && (
        <RightSidebarTaskbar navItems={navigationItems} user={mockCurrentUser} />
      )}
      <main className={!isLoginPage ? 'main-content' : 'login-content'}>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/assignment" element={<AssignmentPage />} />
          <Route path="/entries" element={<EntriesManagementPage />} />
          <Route path="/employees" element={<EmployeesManagementPage />} />
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
