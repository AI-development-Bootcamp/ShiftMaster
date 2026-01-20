import { FormFooterProps } from './types';
import { PlusIcon, SpinnerIcon } from '../../constants/icons';



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
                    <SpinnerIcon className="form-shell__spinner" />
                ) : (
                    <PlusIcon />
                )}
                <span>{primaryActionLabel}</span>
            </button>
        </footer>
    );
}
