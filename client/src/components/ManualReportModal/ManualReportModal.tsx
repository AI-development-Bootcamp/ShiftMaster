import { useState } from 'react';
import './ManualReportModal.css';

interface ManualReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function ManualReportModal({ isOpen, onClose }: ManualReportModalProps) {
  const [activeTab, setActiveTab] = useState<'work' | 'absence'>('work');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose} aria-label="סגור">
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

          <div className="date-display">יום ב' 06/10/25</div>

          <div className="time-entries">
            <div className="time-entry-row">
              <span className="time-value">09:04</span>
              <span className="time-label">כניסה</span>
            </div>
            <div className="time-entry-row">
              <span className="time-value">09:04</span>
              <span className="time-label">יציאה</span>
            </div>
          </div>

          <button className="add-project-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M10 6V14M6 10H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>הוספת פרויקט</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManualReportModal;
