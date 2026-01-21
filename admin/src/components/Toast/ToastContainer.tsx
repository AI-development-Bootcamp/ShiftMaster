import { createPortal } from 'react-dom';
import { Toast, ToastProps } from './Toast';

export interface ToastContainerProps {
  toasts: Omit<ToastProps, 'onDismiss'>[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) {
    return null;
  }

  return createPortal(
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>,
    document.body
  );
}
