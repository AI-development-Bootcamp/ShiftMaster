import { useState, useCallback } from 'react';
import { ToastVariant } from './Toast';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  code?: string;
}

/** Input type for toast methods - accepts either a string or an object with message and optional code */
export type ToastInput = string | { message: string; code?: string };

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((input: ToastInput, variant: ToastVariant, duration = 5000) => {
    const id = `toast-${++toastIdCounter}-${Date.now()}`;
    const message = typeof input === 'string' ? input : input.message;
    const code = typeof input === 'string' ? undefined : input.code;
    const newToast: ToastItem = { id, message, variant, duration, code };

    setToasts((prev) => [...prev, newToast]);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback((input: ToastInput, duration?: number) => {
    return addToast(input, 'success', duration);
  }, [addToast]);

  const showError = useCallback((input: ToastInput, duration?: number) => {
    return addToast(input, 'error', duration);
  }, [addToast]);

  const showWarning = useCallback((input: ToastInput, duration?: number) => {
    return addToast(input, 'warning', duration);
  }, [addToast]);

  const showInfo = useCallback((input: ToastInput, duration?: number) => {
    return addToast(input, 'info', duration);
  }, [addToast]);

  return {
    toasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast,
  };
}
