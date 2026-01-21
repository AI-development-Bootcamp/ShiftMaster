import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isValidEmail } from '@abra-shift-master/shared';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser } from '../../store/slices/authSlice';
import '../../styles/LoginPage.css';

// Assets
import welcomeIllustration from '../../assets/images/welcome-illustration.svg';
import loginBackground from '../../assets/images/login-background.png';
import abraLogo from '../../assets/images/abra-logo.svg';

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    loading,
    error: authError,
    isAuthenticated,
  } = useAppSelector((state) => state.auth);

  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedEmail = email.trim();

    // Validate email
    if (!trimmedEmail) {
      newErrors.email = t('login.validation.emailRequired');
    } else if (!isValidEmail(trimmedEmail)) {
      newErrors.email = t('login.validation.emailInvalid');
    }

    // Validate password (minimum 6 characters)
    if (!password) {
      newErrors.password = t('login.validation.passwordRequired');
    } else if (password.length < 6) {
      newErrors.password = t('login.validation.passwordMinLength');
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    // Normalize email state with trimmed value on success
    if (isValid) {
      setEmail(trimmedEmail);
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      await dispatch(loginUser({ email, password, source: 'client' }));
    }
  };

  // Map auth errors to Hebrew messages or use generic
  const getErrorMessage = () => {
    if (errors.general) return errors.general;
    if (!authError) return null;

    switch (authError) {
      case 'INVALID_CREDENTIALS':
        return 'אימייל או סיסמה שגויים';
      case 'ACCESS_DENIED':
        return 'אין לך הרשאה להתחבר לאפליקציה זו';
      case 'NETWORK_ERROR':
        return 'שגיאת תקשורת, אנא נסה שנית';
      default:
        return 'אירעה שגיאה בהתחברות';
    }
  };

  const generalError = getErrorMessage();

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
        <img src={abraLogo} alt="Abra Logo" className="login-logo" />

        {/* Welcome illustration */}
        <img
          src={welcomeIllustration}
          alt="Welcome illustration"
          className="login-illustration"
        />

        {/* Welcome text */}
        <h1 className="login-title">{t('login.welcomeTitle')}</h1>

        {/* Description text */}
        <p className="login-description">
          {t('login.description')}
          <br />
          {t('login.descriptionLine2')}
          <br />
          {t('login.descriptionLine3')}
        </p>

        {/* Login form */}
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-input-group">
            <label htmlFor="email-input" className="visually-hidden">
              {t('login.emailLabel')}
            </label>
            <input
              id="email-input"
              type="email"
              className={`login-input ${errors.email ? 'input-error' : ''}`}
              placeholder={t('login.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              dir="rtl"
              autoComplete="email"
              disabled={loading}
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
            <label htmlFor="password-input" className="visually-hidden">
              {t('login.passwordLabel')}
            </label>
            <input
              id="password-input"
              type="password"
              className={`login-input ${errors.password ? 'input-error' : ''}`}
              placeholder={t('login.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="rtl"
              autoComplete="current-password"
              disabled={loading}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <p id="password-error" className="login-error" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          {generalError && (
            <div
              className="login-error-general"
              role="alert"
              style={{
                color: 'red',
                marginBottom: '1rem',
                textAlign: 'center',
              }}
            >
              {generalError}
            </div>
          )}

          {/* Submit button */}
          <button type="submit" className="login-button">
            {t('login.submitButton')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
