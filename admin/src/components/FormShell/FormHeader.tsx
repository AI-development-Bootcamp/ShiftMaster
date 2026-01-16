import { FormHeaderProps } from './types';

/**
 * CloseButton icon component
 */
const CloseIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="20"
        height="20"
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

/**
 * FormHeader - Modal header with title, subtitle, and close button
 */
export function FormHeader({ title, subtitle, onClose }: FormHeaderProps) {
    return (
        <header className="form-shell__header">
            <button
                type="button"
                className="form-shell__close-button"
                onClick={onClose}
                aria-label="סגור טופס"
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
