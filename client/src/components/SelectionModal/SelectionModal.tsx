import './SelectionModal.css';

export type SelectionType = 'project' | 'task' | 'location';

export interface SelectionGroup {
  title: string;
  items: string[];
}

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: SelectionType;
  groups: SelectionGroup[];
  onSelect: (value: string) => void;
}

function SelectionModal({ isOpen, onClose, type, groups, onSelect }: SelectionModalProps) {
  if (!isOpen) return null;

  const getTitle = () => {
    switch (type) {
      case 'project':
        return 'בחר פרויקט';
      case 'task':
        return 'בחר משימה';
      case 'location':
        return 'בחר מיקום';
      default:
        return 'בחירה';
    }
  };

  const handleItemClick = (value: string) => {
    onSelect(value);
    onClose();
  };

  return (
    <div className="selection-modal-overlay" onClick={onClose}>
      <div className="selection-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="selection-modal-header">
          <button className="selection-modal-close-btn" onClick={onClose} aria-label="סגור">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <h2 className="selection-modal-title">{getTitle()}</h2>
        </div>

        <div className="selection-modal-body">
          {groups.map((group, groupIndex) => (
            <div key={groupIndex} className="selection-group">
              <h3 className="selection-group-title">{group.title}</h3>
              <div className="selection-items">
                {group.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="selection-item"
                    onClick={() => handleItemClick(item)}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SelectionModal;
