import { useState } from 'react';
import { ManualReportModalProps } from '../../types/manualReport';
import { CloseIcon } from '../icons';
import { WorkTab } from '../WorkTab';
import { AbsenceTab } from '../AbsenceTab';
import { SelectionGroup } from '../../../../components/SelectionModal/SelectionModal';
import '../../styles/manualReportModal.css';

function ManualReportModal({
  isOpen,
  onClose,
  currentDayAbsenceType = null,
  selectedDate = new Date(),
}: ManualReportModalProps) {
  const [activeTab, setActiveTab] = useState<'work' | 'absence'>('work');

  const projectGroups: SelectionGroup[] = [];

  const taskGroups: SelectionGroup[] = [
    {
      title: 'משימות',
      items: ['פיתוח', 'בדיקות', 'תיעוד', 'ישיבות', 'תכנון', 'Code Review'],
    },
  ];

  const locationGroups: SelectionGroup[] = [
    {
      title: 'מיקום',
      items: ['משרד', 'עבודה מהבית', 'אצל לקוח', 'בחוץ'],
    },
  ];

  const handleSave = () => {
    if (activeTab === 'work') {
      // TODO: Save the work data to backend/state
      console.log('Saving work data');
    } else {
      // TODO: Save the absence data to backend/state
      console.log('Saving absence data');
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="סגור"
          >
            <CloseIcon />
          </button>
          <h2 className="modal-title">דיווח ידני</h2>
        </div>

        <div className="modal-body">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'work' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('work')}
            >
              דיווח עבודה
            </button>
            <button
              className={`tab ${activeTab === 'absence' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('absence')}
            >
              דיווח היעדרות
            </button>
          </div>

          {activeTab === 'work' && (
            <WorkTab
              selectedDate={selectedDate}
              projectGroups={projectGroups}
              taskGroups={taskGroups}
              locationGroups={locationGroups}
            />
          )}

          {activeTab === 'absence' && (
            <AbsenceTab selectedDate={selectedDate} />
          )}
        </div>

        <div className="modal-footer">
          <button className="footer-save-btn" onClick={handleSave}>
            שמירה
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManualReportModal;
