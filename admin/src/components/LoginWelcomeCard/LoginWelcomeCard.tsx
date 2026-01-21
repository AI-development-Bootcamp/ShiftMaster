import { useState, FormEvent, FocusEvent } from 'react';
import abraLogo from '../../assets/abra_logo_text.svg';
import { isValidEmail } from '@abra-shift-master/shared';
import { MIN_PASSWORD_LENGTH, VALIDATION_MESSAGES } from '../../constants';
import { EyeIcon, EyeOffIcon } from '../../constants/icons';
import { useTranslation } from 'react-i18next';
import '../../styles/LoginWelcomeCard.css';
import { useAppDispatch, useAppSelector } from '../../store';
import { loginUser } from '../../store/slices/authSlice';

interface LoginWelcomeCardProps {
  error?: string | null;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
  code?: string;
}

export function LoginWelcomeCard({ error }: LoginWelcomeCardProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { loading, error: authError } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });

  // Use local loading state to sync with Redux loading if needed,
  // but simpler to just use Redux loading state directly.
  // const [isLoading, setIsLoading] = useState(false); 

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

    setErrors({});

    await dispatch(loginUser({ email, password, source: 'admin' }));
  };

  const isSubmitDisabled = loading || !email || !password;

  // Display external error if it exists and no local error overrides it
  // Prefer component-passed error over Redux error if both exist? 
  // Or combine? For now, we'll use either.
  // We can map backend error codes to localized strings here or in dictionary.
  // Assuming authError is a code like 'INVALID_CREDENTIALS'.
  const displayGeneralError = errors.general || error || (authError ? t(`errors.${authError}`, authError) : null);
  const displayErrorCode = errors.code || authError;

  return (
    <div className="login-card">
      <div className="login-card__logo">
        <img src={abraLogo} alt="Abra Logo" />
      </div>

      <div className="login-card__welcome">
        <h1 className="login-card__welcome-title">{t('login.welcomeTitle')}</h1>
      </div>

      <form className="login-card__form" onSubmit={handleSubmit} noValidate>
        <div className="login-card__field">
          <label htmlFor="email" className="login-card__label">
            {t('login.emailLabel')}
          </label>
          <input
            id="email"
            type="email"
            className={`login-card__input login-card__input--ltr ${touched.email && errors.email ? 'login-card__input--error' : ''
              }`}
            placeholder={t('login.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={handleEmailBlur}
            disabled={loading}
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
            {t('login.passwordLabel')}
          </label>
          <div className="login-card__password-wrapper">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className={`login-card__input login-card__input--with-toggle ${touched.password && errors.password ? 'login-card__input--error' : ''
                }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={handlePasswordBlur}
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="login-card__password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {touched.password && errors.password && (
            <span className="login-card__error" role="alert">
              {errors.password}
            </span>
          )}
        </div>

        {displayGeneralError && (
          <div className="login-card__general-error-container">
            <div
              className="login-card__general-error"
              role="alert"
              data-error-code={displayErrorCode}
            >
              {displayGeneralError}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="login-card__button"
          disabled={isSubmitDisabled}
        >
          {loading ? t('login.submittingButton') : t('login.submitButton')}
        </button>
      </form>
    </div>
  );
}

export default LoginWelcomeCard;