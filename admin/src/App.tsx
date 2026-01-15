import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/reset.css';
import './styles/global.css';

// Import pages as they are created
// import DashboardPage from './pages/Dashboard';
// import LoginPage from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <div className="app" dir="rtl">
        <Routes>
          <Route path="/" element={<div className="page">מערכת ניהול AbraShiftMaster</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
          {/* Add more routes here */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

