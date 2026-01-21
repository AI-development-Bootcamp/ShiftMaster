import { WarningTriangleIcon } from '../icons';
import { MissingHoursDialogProps } from '../../types/manualReport';

function MissingHoursDialog({
  isOpen,
  missingHours,
  onComplete,
  onDontShowAgain,
}: MissingHoursDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="confirmation-overlay" onClick={() => {}}>
      <div
        className="confirmation-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirmation-icon-wrapper">
          <WarningTriangleIcon />
        </div>
        <p className="confirmation-main-message">יום העבודה שלך טרם הושלם.</p>
        <p className="confirmation-sub-message">
          חסרות {Math.max(0, missingHours)} שעות דיווח כדי למלוא את היום.
        </p>
        <button
          type="button"
          className="confirmation-link-btn"
          onClick={onDontShowAgain}
        >
          אל תציג לנו זאת
        </button>
        <button
          type="button"
          className="confirmation-primary-btn"
          onClick={onComplete}
        >
          תן לי להשלים את השעות
        </button>
      </div>
    </div>
  );
}

export default MissingHoursDialog;
