import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isValidEmail } from '@abra-shift-master/shared';
import './LoginPage.css';

// Assets
import welcomeIllustration from '../../assets/images/welcome-illustration.svg';
import loginBackground from '../../assets/images/login-background.png';
import abraLogo from '../../assets/images/abra-logo.svg';

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
    const trimmedEmail = email.trim();

    // Validate email
    if (!trimmedEmail) {
      newErrors.email = 'יש להזין אימייל';
    } else if (!isValidEmail(trimmedEmail)) {
      newErrors.email = 'פורמט אימייל לא תקין';
    }

    // Validate password (minimum 6 characters)
    if (!password) {
      newErrors.password = 'יש להזין סיסמה';
    } else if (password.length < 6) {
      newErrors.password = 'הסיסמה חייבת להכיל לפחות 6 תווים';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    // Normalize email state with trimmed value on success
    if (isValid) {
      setEmail(trimmedEmail);
    }

    return isValid;
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
        src={loginBackground}
        alt=""
        className="login-background"
        aria-hidden="true"
      />

      {/* Login card */}
      <div className="login-card">
        {/* Abra Logo */}
        <img
          src={abraLogo}
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
            <label htmlFor="email-input" className="visually-hidden">אימייל</label>
            <input
              id="email-input"
              type="email"
              className={`login-input ${errors.email ? 'input-error' : ''}`}
              placeholder="אימייל"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="rtl"
              autoComplete="email"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="login-error" role="alert">
                {errors.email}
              </p>
            )}
          </div>
          <div className="login-input-group">
            <label htmlFor="password-input" className="visually-hidden">סיסמה</label>
            <input
              id="password-input"
              type="password"
              className={`login-input ${errors.password ? 'input-error' : ''}`}
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="rtl"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <p id="password-error" className="login-error" role="alert">
                {errors.password}
              </p>
            )}
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
