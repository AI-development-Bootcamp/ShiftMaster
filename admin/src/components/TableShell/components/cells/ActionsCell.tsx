import { RowActionsConfig } from '../../types';
import { EditIcon, DeleteIcon } from '../../../../constants/icons';

interface ActionsCellProps<T> {
    row: T;
    config: RowActionsConfig<T>;
}

export function ActionsCell<T>({ row, config }: ActionsCellProps<T>) {
    const { showEdit, showDelete, showAdd, onEdit, onDelete, onAdd } = config;

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
            {showEdit && onEdit && (
                <button
                    type="button"
                    className="table-shell__action-btn"
                    onClick={() => onEdit(row)}
                    title="ערוך"
                >
                    <EditIcon width={16} height={16} />
                </button>
            )}
            {showAdd && onAdd && (
                <button
                    type="button"
                    className="table-shell__action-btn"
                    onClick={() => onAdd(row)}
                    title="הוסף"
                >
                    ➕
                </button>
            )}
            {showDelete && onDelete && (
                <button
                    type="button"
                    className="table-shell__action-btn table-shell__action-btn--delete"
                    onClick={handleDelete}
                    title="מחק"
                >
                    <DeleteIcon width={16} height={16} />
                </button>
            )}
        </div>
    );
}
