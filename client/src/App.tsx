import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/reset.css';
import './styles/global.css';

// Import pages
import LoginPage from './pages/Login/LoginPage';
import HomePage from './pages/Home/HomePage';

import { useEffect } from 'react';
import { useAppDispatch } from './store';
import { initializeAuth } from './store/slices/authSlice';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="app" dir="rtl">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
