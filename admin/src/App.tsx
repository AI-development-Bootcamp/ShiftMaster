import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles/reset.css';
import './styles/global.css';
import './styles/App.css';
import { RightSidebarTaskbar } from './components/RightSidebarTaskbar';
import { navigationItems } from './config/navigation';
import { LoginPage } from './pages/LoginPage';
import { AssignmentPage } from './pages/AssignmentPage';
import { EntriesManagementPage } from './pages/EntriesManagementPage';
import { EmployeesManagmentPage } from './pages/EmployeesManagmentPage';
import { mockCurrentUser } from './mocks/users';
import { DesktopOnlyOverlay } from './components/DesktopOnlyOverlay/DesktopOnlyOverlay';

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

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
          <Route path="/employees" element={<EmployeesManagmentPage />} />
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
