import { FormHeaderProps } from './types';
import { CloseIcon } from '../../constants/icons';
import { useTranslation } from 'react-i18next';


/**
 * FormHeader - Modal header with title, subtitle, and close button
 */
export function FormHeader({ title, subtitle, onClose }: FormHeaderProps) {
    const { t } = useTranslation();
    return (
        <header className="form-shell__header">
            <button
                type="button"
                className="form-shell__close-button"
                onClick={onClose}
                aria-label={t('formShell.closeForm')}
            >
                <CloseIcon />
            </button>
            <div className="form-shell__title-container">
                <h2 id="form-shell-title" className="form-shell__title">
                    {title}
                </h2>
                {subtitle && (
                    <p className="form-shell__subtitle">{subtitle}</p>
                )}
            </div>
        </header>
    );
}
