import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/reset.css';
import './styles/global.css';

// Import pages
import LoginPage from './pages/Login/LoginPage';
import HomePage from './pages/Home/HomePage';

/**
 * Top-level application component that configures client-side routes and sets the UI direction to right-to-left.
 *
 * Defines routes for "/login" and "/home", and redirects both the root ("/") and any unknown path ("*") to "/login".
 *
 * @returns The React element containing the BrowserRouter, RTL app container, and route definitions.
 */
function App() {
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