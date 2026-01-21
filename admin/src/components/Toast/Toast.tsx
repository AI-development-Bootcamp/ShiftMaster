import { useEffect } from 'react';
import { ToastSuccessIcon, ToastErrorIcon, ToastWarningIcon, ToastInfoIcon, CloseIcon } from '../../constants/icons';


export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  onDismiss: (id: string) => void;
}

const ICONS = {
  success: <ToastSuccessIcon />,
  error: <ToastErrorIcon />,
  warning: <ToastWarningIcon />,
  info: <ToastInfoIcon />,
};


export function Toast({ id, message, variant, duration = 5000, onDismiss }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  return (
    <div
      className={`toast toast--${variant}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="toast__icon">
        {ICONS[variant]}
      </div>
      <div className="toast__message">
        {message}
      </div>
      <button
        className="toast__close"
        onClick={() => onDismiss(id)}
        aria-label="סגור התראה"
        type="button"
      >
        <CloseIcon width="16" height="16" />

      </button>
    </div>
  );
}
