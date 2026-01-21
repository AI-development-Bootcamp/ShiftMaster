export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
];

export const FILE_UPLOAD_MESSAGES = {
  FILE_TOO_LARGE: 'הקובץ גדול מדי. גודל מקסימלי: 10MB',
  UNSUPPORTED_TYPE: 'סוג קובץ לא נתמך. אנא העלה JPG, PNG או PDF',
};
