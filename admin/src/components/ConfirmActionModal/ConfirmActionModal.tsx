import { useRef, useEffect } from 'react';
import { ConfirmActionModalProps } from './confirmActionTypes';
import { CONFIRM_VARIANTS } from '../../constants/ui';
import '../../styles/ConfirmActionModal.css';

const DEFAULT_ICONS = {
    [CONFIRM_VARIANTS.DANGER]: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
    ),
    [CONFIRM_VARIANTS.PRIMARY]: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
    ),
    [CONFIRM_VARIANTS.WARNING]: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
    ),
    [CONFIRM_VARIANTS.INFO]: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
    )
};

export function ConfirmActionModal({
    isOpen,
    title,
    description,
    variant = CONFIRM_VARIANTS.PRIMARY,
    icon,
    confirmLabel,
    cancelLabel = 'ביטול',
    onConfirm,
    onCancel,
    isLoading = false,
    closeOnBackdropDoubleClick = true,
    closeOnEsc = true,
    disableCancelOnLoading = false,
}: ConfirmActionModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && closeOnEsc) {
            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    if (!isLoading || !disableCancelOnLoading) {
                        onCancel();
                    }
                }
            };
            document.addEventListener('keydown', handleKeyDown);
            return () => document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isOpen, closeOnEsc, onCancel, isLoading, disableCancelOnLoading]);

    // Focus trap minimal implementation
    useEffect(() => {
        if (isOpen) {
            // Small timeout to ensure render
            const timer = setTimeout(() => {
                const confirmBtn = modalRef.current?.querySelector('.confirm-modal__btn--cancel') as HTMLButtonElement;
                confirmBtn?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (closeOnBackdropDoubleClick && e.target === e.currentTarget && e.detail === 2) {
            if (!isLoading || !disableCancelOnLoading) {
                onCancel();
            }
        }
    };

    if (!isOpen) return null;

    const displayIcon = icon || DEFAULT_ICONS[variant];

    return (
        <div
            className="confirm-modal__backdrop"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            aria-describedby={description ? "confirm-modal-desc" : undefined}
        >
            <div
                className={`confirm-modal__container confirm-modal__container--${variant}`}
                ref={modalRef}
            >
                <div className="confirm-modal__content">
                    <div className="confirm-modal__icon-box">
                        {displayIcon}
                    </div>
                    <div className="confirm-modal__text-column">
                        <h2 id="confirm-modal-title" className="confirm-modal__title">{title}</h2>
                        {description && (
                            <p id="confirm-modal-desc" className="confirm-modal__description">{description}</p>
                        )}
                    </div>
                </div>

                <div className="confirm-modal__footer">
                    <button
                        className="confirm-modal__btn confirm-modal__btn--cancel"
                        onClick={onCancel}
                        disabled={isLoading && disableCancelOnLoading}
                    >
                        {cancelLabel}
                    </button>
                    <button
                        className={`confirm-modal__btn confirm-modal__btn--${variant}`}
                        onClick={async () => {
                            try {
                                await onConfirm();
                            } catch (error) {
                                // Report error using project's error reporting if available or console
                                console.error({ code: 'CONFIRM_ACTION_FAIL', error });
                            }
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'טוען...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
