import { useState, FormEvent, FocusEvent } from 'react';
import abraLogo from '../../assets/abra_logo_text.svg';
import { isValidEmail } from '@abra-shift-master/shared';
import { MIN_PASSWORD_LENGTH, VALIDATION_MESSAGES } from '../../constants';
import './LoginWelcomeCard.css';

interface LoginWelcomeCardProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export function LoginWelcomeCard({ onLogin }: LoginWelcomeCardProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string): string | undefined => {
    if (!value.trim()) {
      return VALIDATION_MESSAGES.email.required;
    }
    if (!isValidEmail(value)) {
      return VALIDATION_MESSAGES.email.invalid;
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (!value) {
      return VALIDATION_MESSAGES.password.required;
    }
    if (value.length < MIN_PASSWORD_LENGTH) {
      return VALIDATION_MESSAGES.password.tooShort;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setErrors({
      email: emailError,
      password: passwordError,
    });

    return !emailError && !passwordError;
  };

  const handleEmailBlur = (e: FocusEvent<HTMLInputElement>) => {
    setTouched((prev) => ({ ...prev, email: true }));
    const error = validateEmail(e.target.value);
    setErrors((prev) => ({ ...prev, email: error, general: undefined }));
  };

  const handlePasswordBlur = (e: FocusEvent<HTMLInputElement>) => {
    setTouched((prev) => ({ ...prev, password: true }));
    const error = validatePassword(e.target.value);
    setErrors((prev) => ({ ...prev, password: error, general: undefined }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({ email: true, password: true });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await onLogin(email, password);
    } catch (error) {
      setErrors({
        general: VALIDATION_MESSAGES.auth.invalidCredentials,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isSubmitDisabled = isLoading || !email || !password;

  return (
    <div className="login-card">
      <div className="login-card__logo">
        <img src={abraLogo} alt="Abra Logo" />
      </div>

      <div className="login-card__welcome">
        <h1 className="login-card__welcome-title">ברוכים הבאים למערכת 👋</h1>
        <p className="login-card__welcome-subtitle">הניהול של אברא</p>
      </div>

      <form className="login-card__form" onSubmit={handleSubmit} noValidate>
        <div className="login-card__field">
          <label htmlFor="email" className="login-card__label">
            כתובת מייל
          </label>
          <input
            id="email"
            type="email"
            className={`login-card__input login-card__input--ltr ${
              touched.email && errors.email ? 'login-card__input--error' : ''
            }`}
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
            disabled={isLoading}
            autoComplete="email"
            dir="ltr"
          />
          {touched.email && errors.email && (
            <span className="login-card__error" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        <div className="login-card__field">
          <label htmlFor="password" className="login-card__label">
            סיסמה
          </label>
          <input
            id="password"
            type="password"
            className={`login-card__input ${
              touched.password && errors.password ? 'login-card__input--error' : ''
            }`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={handlePasswordBlur}
            disabled={isLoading}
            autoComplete="current-password"
          />
          {touched.password && errors.password && (
            <span className="login-card__error" role="alert">
              {errors.password}
            </span>
          )}
        </div>

        {errors.general && (
          <div className="login-card__general-error" role="alert">
            {errors.general}
          </div>
        )}

        <button
          type="submit"
          className="login-card__button"
          disabled={isSubmitDisabled}
        >
          {isLoading ? 'מתחבר...' : 'התחברות'}
        </button>
      </form>
    </div>
  );
}

export default LoginWelcomeCard;
