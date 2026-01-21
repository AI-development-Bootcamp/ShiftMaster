import { useTranslation } from 'react-i18next';
import { WarningTriangleIcon } from '../icons';
import { MissingHoursDialogProps } from '../../types/manualReport';

function MissingHoursDialog({
  isOpen,
  missingHours,
  onComplete,
  onDontShowAgain,
}: MissingHoursDialogProps) {
  const { t } = useTranslation();

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
        <p className="confirmation-main-message">
          {t('dialogs.missingHours.title')}
        </p>
        <p className="confirmation-sub-message">
          {t('dialogs.missingHours.message', { hours: Math.max(0, missingHours) })}
        </p>
        <button
          type="button"
          className="confirmation-link-btn"
          onClick={onDontShowAgain}
        >
          {t('dialogs.missingHours.dontShowAgain')}
        </button>
        <button
          type="button"
          className="confirmation-primary-btn"
          onClick={onComplete}
        >
          {t('dialogs.missingHours.completeHours')}
        </button>
      </div>
    </div>
  );
}

export default MissingHoursDialog;
