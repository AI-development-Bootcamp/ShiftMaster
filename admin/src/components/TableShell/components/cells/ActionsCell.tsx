
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RowActionsConfig, ActionOption } from '../../types';
import { EditIcon, DeleteIcon } from '../../../../constants/icons';

interface ActionsCellProps<T> {
    row: T;
    config: RowActionsConfig<T>;
}

interface ActionDropdownProps<T> {
    options: ActionOption<T>[];
    row: T;
    trigger: React.ReactNode;
}

function ActionDropdown<T>({ options, row, trigger }: ActionDropdownProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
                // If click is not on the trigger, check if it's on the dropdown (which is in a portal)
                const dropdownMenu = document.querySelector('.table-shell__action-dropdown-menu');
                if (dropdownMenu && !dropdownMenu.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            }
        };

        const handleScroll = () => {
            if (isOpen) setIsOpen(false); // Close on scroll to avoid detached menu
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true); // Capture scroll on any element
            window.addEventListener('resize', handleScroll);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [isOpen]);

    const handleToggle = () => {
        if (!isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            // Centered below the trigger
            setPosition({
                top: rect.bottom + 4,
                left: rect.left + rect.width / 2,
            });
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="table-shell__action-dropdown-container" ref={triggerRef}>
            <div onClick={handleToggle} style={{ display: 'inline-block' }}>
                {trigger}
            </div>
            {isOpen && createPortal(
                <div
                    className="table-shell__action-dropdown-menu"
                    style={{
                        position: 'fixed',
                        top: position.top,
                        left: position.left,
                        transform: 'translateX(-50%)', // Center horizontally relative to trigger
                        zIndex: 9999, // Ensure it's on top of everything
                        margin: 0 // Override CSS margin
                    }}
                >
                    {options.map((option, index) => (
                        <button
                            key={index}
                            className={`table-shell__action-dropdown-item ${option.variant === 'danger' ? 'table-shell__action-dropdown-item--danger' : ''}`}
                            onClick={() => {
                                option.onClick(row);
                                setIsOpen(false);
                            }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
}

export function ActionsCell<T>({ row, config }: ActionsCellProps<T>) {
    const {
        showEdit, showDelete, showAdd,
        onEdit, editOptions,
        onDelete, deleteOptions,
        onAdd, addOptions
    } = config;

    const handleDelete = () => {
        if (onDelete) {
            // Delete requires confirmation
            const confirmed = window.confirm('האם אתה בטוח שברצונך למחוק?');
            if (confirmed) {
                onDelete(row);
            }
        }
    };

    return (
        <div className="table-shell__actions">
            {showEdit && (
                editOptions && editOptions.length > 0 ? (
                    <ActionDropdown
                        options={editOptions}
                        row={row}
                        trigger={
                            <button
                                type="button"
                                className="table-shell__action-btn"
                                title="ערוך"
                            >
                                <EditIcon width={16} height={16} />
                            </button>
                        }
                    />
                ) : onEdit && (
                    <button
                        type="button"
                        className="table-shell__action-btn"
                        onClick={() => onEdit(row)}
                        title="ערוך"
                    >
                        <EditIcon width={16} height={16} />
                    </button>
                )
            )}

            {showAdd && (
                addOptions && addOptions.length > 0 ? (
                    <ActionDropdown
                        options={addOptions}
                        row={row}
                        trigger={
                            <button
                                type="button"
                                className="table-shell__action-btn"
                                title="הוסף"
                            >
                                ➕
                            </button>
                        }
                    />
                ) : onAdd && (
                    <button
                        type="button"
                        className="table-shell__action-btn"
                        onClick={() => onAdd(row)}
                        title="הוסף"
                    >
                        ➕
                    </button>
                )
            )}

            {showDelete && (
                deleteOptions && deleteOptions.length > 0 ? (
                    <ActionDropdown
                        options={deleteOptions}
                        row={row}
                        trigger={
                            <button
                                type="button"
                                className="table-shell__action-btn table-shell__action-btn--delete"
                                title="מחק"
                            >
                                <DeleteIcon width={16} height={16} />
                            </button>
                        }
                    />
                ) : onDelete && (
                    <button
                        type="button"
                        className="table-shell__action-btn table-shell__action-btn--delete"
                        onClick={handleDelete}
                        title="מחק"
                    >
                        <DeleteIcon width={16} height={16} />
                    </button>
                )
            )}
        </div>
    );
}
