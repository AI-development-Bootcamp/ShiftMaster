import { useState } from 'react';
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

class SelectionError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'SelectionError';
    this.code = code;
  }
}

function SelectionModal({
  isOpen,
  onClose,
  type,
  groups,
  onSelect,
}: SelectionModalProps) {
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

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

  const getButtonText = () => {
    switch (type) {
      case 'project':
        return 'המשך ובחר פרויקט';
      case 'task':
        return 'המשך ובחר משימה';
      case 'location':
        return 'המשך ובחר מיקום';
      default:
        return 'אישור';
    }
  };

  const handleItemClick = (value: string) => {
    try {
      setSelectedValue(value);
    } catch (error) {
      const selectionError = new SelectionError(
        `Failed to select item: ${value}`,
        'SELECTION_ERROR'
      );
      console.error(selectionError);
      throw selectionError;
    }
  };

  const handleConfirm = () => {
    try {
      if (selectedValue) {
        onSelect(selectedValue);
        setSelectedValue(null);
        onClose();
      }
    } catch (error) {
      const confirmError = new SelectionError(
        `Failed to confirm selection: ${selectedValue}`,
        'CONFIRM_ERROR'
      );
      console.error(confirmError);
      throw confirmError;
    }
  };

  const handleClose = () => {
    try {
      setSelectedValue(null);
      onClose();
    } catch (error) {
      const closeError = new SelectionError(
        'Failed to close selection modal',
        'CLOSE_ERROR'
      );
      console.error(closeError);
      throw closeError;
    }
  };

  return (
    <div className="selection-modal-overlay" onClick={handleClose}>
      <div
        className="selection-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="selection-modal-header">
          <button
            className="selection-modal-close-btn"
            onClick={handleClose}
            aria-label="סגור"
          >
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
                  <button
                    key={itemIndex}
                    type="button"
                    className={`selection-item ${selectedValue === item ? 'selection-item--selected' : ''}`}
                    onClick={() => handleItemClick(item)}
                    aria-pressed={selectedValue === item}
                  >
                    <span className="selection-item-text">{item}</span>
                    {selectedValue === item && (
                      <span className="selection-item-check">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                        >
                          <circle cx="10" cy="10" r="10" fill="#3B82F6" />
                          <path
                            d="M6 10L9 13L14 7"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="selection-modal-footer">
          <button
            className="selection-modal-confirm-btn"
            onClick={handleConfirm}
            disabled={!selectedValue}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectionModal;
