import { DROPDOWN_PLACEMENT } from '../../constants/ui';

export interface CreateMenuOption {
    id: string;
    label: string;
    disabled?: boolean;
    onSelect: () => void;
}

export type DropdownPlacement = typeof DROPDOWN_PLACEMENT[keyof typeof DROPDOWN_PLACEMENT];

export interface CreateDropdownMenuProps {
    label?: string;
    options: CreateMenuOption[];
    closeOnOutsideClick?: boolean;
    closeOnEsc?: boolean;
    placement?: DropdownPlacement;
    onOpenChange?: (isOpen: boolean) => void;
}
