import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/CreateDropdownMenu.css';
import { CreateDropdownMenuProps } from './types';
import { DROPDOWN_PLACEMENT } from '../../constants/ui';

export const CreateDropdownMenu: React.FC<CreateDropdownMenuProps> = ({
    label = 'יצירה',
    options,
    closeOnOutsideClick = true,
    closeOnEsc = true,
    placement = DROPDOWN_PLACEMENT.BOTTOM_END,
    onOpenChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const updatePosition = React.useCallback(() => {
        if (!triggerRef.current || !isOpen) return;
        const rect = triggerRef.current.getBoundingClientRect();

        const top = rect.bottom + 4; // 4px buffer
        let left = rect.left;

        // Simple placement logic based on rect and placement prop
        // Note: For a robust solution, consider libraries like Popper.js
        if (placement === DROPDOWN_PLACEMENT.BOTTOM_END) {
            left = rect.right; // Will need adjustment based on dropdown width, handled in CSS or better here? 
            // CSS 'right: 0' doesn't work well with fixed positioning unless we know width. 
            // Better to calculate exact left.
            // If we want it to align RIGHT edge to RIGHT edge of trigger:
            // We need the dropdown width. But we can't measuring it before rendering easily without two-pass.
            // Simplification: We will just position it and let CSS translate deal with alignment if needed, 
            // OR simpler: just align left for now or verify typical usage.
            // The user wanted simple bottom appearance.
        }

        setPosition({ top, left });
    }, [isOpen, placement]);

    // Recalculate position on open and scroll/resize
    useLayoutEffect(() => {
        if (isOpen) {
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
        }
        return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
        };
    }, [isOpen, updatePosition]);

    const toggleOpen = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        onOpenChange?.(newState);
    };

    const handleOptionClick = (action: () => void, disabled?: boolean) => {
        if (disabled) return;
        action();
        setIsOpen(false);
        onOpenChange?.(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!closeOnOutsideClick || !isOpen) return;

            // Check if click is on trigger or inside dropdown
            const target = event.target as Node;
            if (triggerRef.current?.contains(target)) return;
            if (dropdownRef.current?.contains(target)) return;

            setIsOpen(false);
            onOpenChange?.(false);
        };

        const handleEscKey = (event: KeyboardEvent) => {
            if (closeOnEsc && isOpen && event.key === 'Escape') {
                setIsOpen(false);
                onOpenChange?.(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, closeOnOutsideClick, closeOnEsc, onOpenChange]);

    const dropdownContent = (
        <div
            className="create-menu__dropdown"
            role="menu"
            ref={dropdownRef}
            style={{
                top: position.top,
                // Adjusting horizontal position logic
                // For 'BOTTOM_END' (RTL context usually means aligned to right edge in LTR, or left edge in RTL?)
                // Assuming standard behavior: align Start = left, End = right (of the trigger).
                // However, with fixed positioning, it's easier to set 'left' and translate if needed.
                left: placement === DROPDOWN_PLACEMENT.BOTTOM_END
                    ? undefined
                    : (placement === DROPDOWN_PLACEMENT.BOTTOM ? position.left + (triggerRef.current?.offsetWidth || 0) / 2 : position.left),

                right: placement === DROPDOWN_PLACEMENT.BOTTOM_END
                    ? window.innerWidth - (triggerRef.current?.getBoundingClientRect().right || 0)
                    : undefined,

                transform: placement === DROPDOWN_PLACEMENT.BOTTOM ? 'translateX(-50%)' : undefined,
            }}
        >
            {options.map((option) => (
                <button
                    key={option.id}
                    className="create-menu__item"
                    role="menuitem"
                    onClick={() => handleOptionClick(option.onSelect, option.disabled)}
                    disabled={option.disabled}
                >
                    {option.label}
                </button>
            ))}
            {options.length === 0 && (
                <div className="create-menu__item" style={{ cursor: 'default', color: '#999' }}>
                    אין אפשרויות
                </div>
            )}
        </div>
    );

    return (
        <div className="create-menu">
            <button
                ref={triggerRef}
                className="create-menu__trigger"
                onClick={toggleOpen}
                aria-haspopup="menu"
                aria-expanded={isOpen}
            >
                {/* Chevron Down Icon (18x18) */}
                <svg
                    className="create-menu__icon"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
                <span className="create-menu__label">{label}</span>
            </button>

            {isOpen && createPortal(dropdownContent, document.body)}
        </div>
    );
};
