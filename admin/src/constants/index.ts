/**
 * Validation constants for the admin application
 */

export const MIN_PASSWORD_LENGTH = 8;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const VALIDATION_MESSAGES = {
  email: {
    required: 'יש להזין כתובת מייל',
    invalid: 'כתובת המייל אינה תקינה',
  },
  password: {
    required: 'יש להזין סיסמה',
    tooShort: `הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים`,
  },
  auth: {
    invalidCredentials: 'כתובת מייל או סיסמה שגויים',
  },
};
