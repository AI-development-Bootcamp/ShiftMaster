import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/reset.css';
import './styles/global.css';

// Import pages as they are created
// import HomePage from './pages/Home';
// import LoginPage from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <div className="app" dir="rtl">
        <Routes>
          <Route path="/" element={<div className="page">ברוכים הבאים ל-AbraShiftMaster</div>} />
          <Route path="*" element={<Navigate to="/" replace />} />
          {/* Add more routes here */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
