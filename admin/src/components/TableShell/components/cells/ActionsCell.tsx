
import { useState, useRef, useEffect } from 'react';
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
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="table-shell__action-dropdown-container" ref={containerRef}>
            <div onClick={() => setIsOpen(!isOpen)} style={{ display: 'inline-block' }}>
                {trigger}
            </div>
            {isOpen && (
                <div className="table-shell__action-dropdown-menu">
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
                </div>
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
