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
  return (
    <div className="absence-type-section" ref={dropdownRef}>
      <div className="absence-type-selector" onClick={onToggle}>
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
      </div>

      {isOpen && (
        <div className="absence-dropdown">
          {ABSENCE_TYPES.map((type) => (
            <div
              key={type.id}
              className={`absence-dropdown-item ${
                selectedType?.id === type.id
                  ? 'absence-dropdown-item-selected'
                  : ''
              }`}
              onClick={() => {
                onSelect(type);
              }}
            >
              {selectedType?.id === type.id && <CheckIcon />}
              <span className="absence-dropdown-text">
                <span className="absence-emoji">{type.emoji}</span>
                {type.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AbsenceTypeSelector;
