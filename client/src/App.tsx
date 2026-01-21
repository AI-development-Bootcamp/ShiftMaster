import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/reset.css';
import './styles/global.css';

// Import pages
import LoginPage from './pages/Login/LoginPage';
import HomePage from './pages/Home/HomePage';

// Import components
import { ProtectedRoute } from './components/ProtectedRoute';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { initializeAuth } from './store/slices/authSlice';

/**
 * Root redirect component
 * Redirects to /home if authenticated, /login if not
 */
function RootRedirect() {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return null; // Let ProtectedRoute handle loading state
  }

  return <Navigate to={isAuthenticated ? '/home' : '/login'} replace />;
}

/**
 * Login route wrapper
 * Redirects to /home if already authenticated
 */
function LoginRoute() {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

  if (loading) {
    return null; // Don't redirect while checking auth
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <LoginPage />;
}

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Initialize auth on app startup (check for refresh token)
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="app" dir="rtl">
        <Routes>
          <Route path="/login" element={<LoginRoute />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
