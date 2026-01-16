import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

// Figma asset URLs (valid for 7 days)
const assets = {
  background: 'https://www.figma.com/api/mcp/asset/a860dadc-cc01-455b-9d34-b4df99f8b018',
  logo: 'https://www.figma.com/api/mcp/asset/a9f21820-9489-447d-88d0-44e3b66bbdce',
  illustrationBackground: 'https://www.figma.com/api/mcp/asset/f8d7e664-d0d5-4a30-beb6-ead143fa16f2',
  illustrationFloor: 'https://www.figma.com/api/mcp/asset/3698edab-f931-407d-ba36-3893a3e1428b',
  illustrationStopwatch: 'https://www.figma.com/api/mcp/asset/9b1e1802-e72b-4033-9f8a-6297633bf2aa',
  illustrationCalendar: 'https://www.figma.com/api/mcp/asset/e1f03fb1-8b17-4478-880e-53492960ea5a',
  illustrationCharacter: 'https://www.figma.com/api/mcp/asset/bd3510d1-e70e-42ca-b1c7-8c86bc5f763f',
  illustrationPlant: 'https://www.figma.com/api/mcp/asset/7552def4-7eeb-4a3a-91f8-6e8a2b373014',
};

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No authentication logic - just navigate to home
    navigate('/home');
  };

  return (
    <div className="login-page">
      {/* Background cityscape image */}
      <img
        src={assets.background}
        alt=""
        className="login-background"
        aria-hidden="true"
      />

      {/* Login card */}
      <div className="login-card">
        {/* Abra Logo */}
        <img
          src={assets.logo}
          alt="Abra Logo"
          className="login-logo"
        />

        {/* Illustration container */}
        <div className="login-illustration">
          <img
            src={assets.illustrationBackground}
            alt=""
            className="illustration-bg"
            aria-hidden="true"
          />
          <img
            src={assets.illustrationFloor}
            alt=""
            className="illustration-floor"
            aria-hidden="true"
          />
          <img
            src={assets.illustrationStopwatch}
            alt=""
            className="illustration-stopwatch"
            aria-hidden="true"
          />
          <img
            src={assets.illustrationCalendar}
            alt=""
            className="illustration-calendar"
            aria-hidden="true"
          />
          <img
            src={assets.illustrationCharacter}
            alt=""
            className="illustration-character"
            aria-hidden="true"
          />
          <img
            src={assets.illustrationPlant}
            alt=""
            className="illustration-plant"
            aria-hidden="true"
          />
        </div>

        {/* Welcome text */}
        <h1 className="login-title">ברוכים הבאים!</h1>

        {/* Description text */}
        <p className="login-description">
          ברוכים הבאים למערכת דיווחי השעות שלנו 🥳
          <br />
          שנוצרה במיוחד עבורכם!
          <br />
          יש להתחבר באמצעות הזדהות למטה.
        </p>

        {/* Login form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-group">
            <input
              type="email"
              className="login-input"
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="rtl"
            />
          </div>
          <div className="login-input-group">
            <input
              type="password"
              className="login-input"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="rtl"
            />
          </div>
          <button type="submit" className="login-button">
            התחברות
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
