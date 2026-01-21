import { createPortal } from 'react-dom';
import '../../styles/DesktopOnlyOverlay.css';
import { useTranslation, Trans } from 'react-i18next';

export function DesktopOnlyOverlay() {
    const { t } = useTranslation();

    return createPortal(
        <div className="desktop-only-overlay">
            <div className="desktop-only-content">
                <div className="desktop-only-icon">💻</div>
                <h1>{t('desktopOnlyOverlay.title')}</h1>
                <Trans i18nKey="desktopOnlyOverlay.message" components={[<br key="br" />]} />
            </div>
        </div>,
        document.body
    );
}
