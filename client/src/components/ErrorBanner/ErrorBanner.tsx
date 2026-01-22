/**
 * ErrorBanner component for displaying API errors in forms
 */

import { useTranslation } from 'react-i18next';
import './ErrorBanner.css';

export interface ErrorBannerProps {
    code: string;
    message?: string;
    details?: unknown;
    onClose?: () => void;
}

/**
 * Map error codes to localized messages
 */
function getErrorMessage(
    t: (key: string, options?: Record<string, unknown>) => string,
    code: string,
    details?: unknown
): string {
    switch (code) {
        case 'MONTH_LOCKED': {
            const lockedDetails = details as { month?: number; year?: number } | undefined;
            if (lockedDetails?.month && lockedDetails?.year) {
                return t('errors.monthLocked', {
                    month: lockedDetails.month,
                    year: lockedDetails.year,
                });
            }
            return t('errors.monthLockedGeneric');
        }

        case 'TASK_NOT_ASSIGNED': {
            const taskDetails = details as { taskName?: string } | undefined;
            if (taskDetails?.taskName) {
                return t('errors.taskNotAssigned', { taskName: taskDetails.taskName });
            }
            return t('errors.taskNotAssignedGeneric');
        }

        case 'TIME_FORMAT_MISMATCH': {
            const formatDetails = details as { requiredFormat?: string } | undefined;
            if (formatDetails?.requiredFormat) {
                const formatLabel = formatDetails.requiredFormat === 'start_end'
                    ? t('errors.formats.startEnd')
                    : t('errors.formats.sum');
                return t('errors.timeFormatMismatch', { format: formatLabel });
            }
            return t('errors.timeFormatMismatchGeneric');
        }

        case 'INVALID_TIME_RANGE':
            return t('errors.invalidTimeRange');

        case 'MISSING_TIME_DATA':
            return t('errors.missingTimeData');

        case 'MISSING_DURATION':
            return t('errors.missingDuration');

        case 'NETWORK_ERROR':
            return t('errors.networkError');

        case 'VALIDATION_ERROR':
            return t('errors.validationError');

        case 'INVALID_ABSENCE_TYPE':
            return t('errors.invalidAbsenceType');

        case 'TASK_NOT_FOUND':
            return t('errors.taskNotFound');

        case 'TASK_INACTIVE':
            return t('errors.taskInactive');

        default:
            return t('errors.unknownError');
    }
}

function ErrorBanner({ code, message, details, onClose }: ErrorBannerProps) {
    const { t } = useTranslation();

    const displayMessage = message || getErrorMessage(t, code, details);

    return (
        <div className="error-banner" role="alert">
            <div className="error-banner-content">
                <span className="error-banner-icon">⚠️</span>
                <span className="error-banner-message">{displayMessage}</span>
            </div>
            {onClose && (
                <button
                    className="error-banner-close"
                    onClick={onClose}
                    aria-label={t('common.close')}
                >
                    ×
                </button>
            )}
        </div>
    );
}

export default ErrorBanner;
