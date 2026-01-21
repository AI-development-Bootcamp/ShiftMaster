import { ReactNode } from 'react';

import { CONFIRM_VARIANTS } from '../../constants/ui';

export type ConfirmVariant = typeof CONFIRM_VARIANTS[keyof typeof CONFIRM_VARIANTS];

export interface ConfirmActionModalProps {
    /** Controls whether the modal is rendered/visible */
    isOpen: boolean;

    /** Header title (e.g., "מחיקת משימה", "אישור פעולה") */
    title: string;

    /** Supporting description text (optional) */
    description?: string;

    /** Visual preset affecting colors and optional default icon */
    variant?: ConfirmVariant; // default: 'primary'

    /** Optional icon override for the IconBox */
    icon?: ReactNode;

    /** Confirm button label (e.g., "מחיקה", "אישור", "המשך") */
    confirmLabel: string;

    /** Cancel button label */
    cancelLabel?: string; // default: "ביטול"

    /** Called when user confirms action */
    onConfirm: () => Promise<void> | void;

    /** Called when modal should close without confirming */
    onCancel: () => void;

    /** Loading state for confirm action */
    isLoading?: boolean; // default: false

    /** If true, closes on double-click on the backdrop */
    closeOnBackdropDoubleClick?: boolean; // default: true

    /** If true, ESC closes the modal */
    closeOnEsc?: boolean; // default: true

    /** If true, disables cancel while loading */
    disableCancelOnLoading?: boolean; // default: false
}
