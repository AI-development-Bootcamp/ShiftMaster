import { FormFooterProps } from './types';

/**
 * Plus icon for submit button
 */
const PlusIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="18"
        height="18"
    >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

/**
 * Spinner icon for loading state
 */
const SpinnerIcon = () => (
    <svg
        className="form-shell__spinner"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        width="18"
        height="18"
    >
        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1" />
    </svg>
);

/**
 * FormFooter - Footer with server error banner and submit button
 */
export function FormFooter({
    primaryActionLabel,
    onSubmit,
    isSubmitting,
    disabled,
    serverError,
}: FormFooterProps) {
    return (
        <footer className="form-shell__footer">
            {serverError && (
                <div className="form-shell__server-error" role="alert">
                    {serverError}
                </div>
            )}
            <button
                type="button"
                className="form-shell__submit-button"
                onClick={onSubmit}
                disabled={disabled || isSubmitting}
                aria-busy={isSubmitting}
            >
                {isSubmitting ? (
                    <SpinnerIcon />
                ) : (
                    <PlusIcon />
                )}
                <span>{primaryActionLabel}</span>
            </button>
        </footer>
    );
}
