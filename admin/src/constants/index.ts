export const MIN_PASSWORD_LENGTH = 8;

export const VALIDATION_MESSAGES = {
  email: {
    required: 'נא להזין כתובת אימייל',
    invalid: 'כתובת האימייל אינה תקינה',
  },
  password: {
    required: 'נא להזין סיסמה',
    tooShort: `הסיסמה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים`,
  },
  auth: {
    invalidCredentials: 'שם המשתמש או הסיסמה שגויים',
  },
};

export const DEV_CREDENTIALS = {
  email: 'dev@test.com',
  password: 'password',
};
