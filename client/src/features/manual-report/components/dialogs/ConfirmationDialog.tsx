import { WarningTriangleIcon } from '../icons';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

function ConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'מחק את הפרויקט',
  cancelText = 'מעדיף שלא למחוק',
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="confirmation-overlay" onClick={onCancel}>
      <div
        className="confirmation-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirmation-icon-wrapper">
          <WarningTriangleIcon />
        </div>
        <p className="confirmation-main-message">{title}</p>
        <p className="confirmation-sub-message">{message}</p>
        <button
          type="button"
          className="confirmation-link-btn"
          onClick={onCancel}
        >
          {cancelText}
        </button>
        <button
          type="button"
          className="confirmation-primary-btn"
          onClick={onConfirm}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}

export default ConfirmationDialog;
