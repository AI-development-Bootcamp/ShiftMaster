import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidEmail } from '@abra-shift-master/shared';
import './LoginPage.css';

// Assets
import welcomeIllustration from '../../assets/images/welcome-illustration.svg';

// Figma asset URLs (valid for 7 days)
const assets = {
  background: 'https://www.figma.com/api/mcp/asset/a860dadc-cc01-455b-9d34-b4df99f8b018',
  logo: 'https://www.figma.com/api/mcp/asset/a9f21820-9489-447d-88d0-44e3b66bbdce',
};

interface FormErrors {
  email?: string;
  password?: string;
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'יש להזין אימייל';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'פורמט אימייל לא תקין';
    }

    // Validate password (minimum 6 characters)
    if (!password) {
      newErrors.password = 'יש להזין סיסמה';
    } else if (password.length < 6) {
      newErrors.password = 'הסיסמה חייבת להכיל לפחות 6 תווים';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // No authentication logic - just navigate to home
      navigate('/home');
    }
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

        {/* Welcome illustration */}
        <img
          src={welcomeIllustration}
          alt="Welcome illustration"
          className="login-illustration"
        />

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
              type="text"
              className={`login-input ${errors.email ? 'input-error' : ''}`}
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="rtl"
            />
            {errors.email && <p className="login-error">{errors.email}</p>}
          </div>
          <div className="login-input-group">
            <input
              type="password"
              className={`login-input ${errors.password ? 'input-error' : ''}`}
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="rtl"
            />
            {errors.password && <p className="login-error">{errors.password}</p>}
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
