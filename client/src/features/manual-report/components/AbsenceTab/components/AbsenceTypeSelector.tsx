import { useRef, useEffect, KeyboardEvent } from 'react';
import { AbsenceType } from '../../../types/manualReport';
import { ABSENCE_TYPES } from '../../../constants/absence';
import { CheckIcon } from '../../icons';

interface AbsenceTypeSelectorProps {
  selectedType: AbsenceType | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (type: AbsenceType) => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

function AbsenceTypeSelector({
  selectedType,
  isOpen,
  onToggle,
  onSelect,
  dropdownRef,
}: AbsenceTypeSelectorProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const focusedIndexRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen && listboxRef.current) {
      // Move focus into the listbox when opened
      const firstOption = listboxRef.current.querySelector(
        '[role="option"]'
      ) as HTMLElement;
      firstOption?.focus();
      focusedIndexRef.current = 0;
    } else if (!isOpen && buttonRef.current) {
      // Return focus to button when closed
      buttonRef.current.focus();
    }
  }, [isOpen]);

  const handleButtonKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggle();
    }
  };

  return (
    <div className="absence-type-section" ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        className="absence-type-selector"
        onClick={onToggle}
        onKeyDown={handleButtonKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="absence-type-chevron">◊</span>
        <span className="absence-type-text">
          {selectedType ? (
            <>
              <span className="absence-emoji">{selectedType.emoji}</span>
              {selectedType.label}
            </>
          ) : (
            'בחר סוג היעדרות'
          )}
        </span>
      </button>

      {isOpen && (
        <div ref={listboxRef} className="absence-dropdown" role="listbox">
          {ABSENCE_TYPES.map((type) => (
            <button
              type="button"
              key={type.id}
              className={`absence-dropdown-item ${
                selectedType?.id === type.id
                  ? 'absence-dropdown-item-selected'
                  : ''
              }`}
              onClick={() => {
                onSelect(type);
              }}
              role="option"
              aria-selected={selectedType?.id === type.id}
            >
              {selectedType?.id === type.id && <CheckIcon />}
              <span className="absence-dropdown-text">
                <span className="absence-emoji">{type.emoji}</span>
                {type.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AbsenceTypeSelector;
