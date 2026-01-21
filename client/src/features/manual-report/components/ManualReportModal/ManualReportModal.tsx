import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ManualReportModalProps } from '../../types/manualReport';
import { CloseIcon } from '../icons';
import { WorkTab } from '../WorkTab';
import { AbsenceTab } from '../AbsenceTab';
import { ConfirmationDialog } from '../dialogs';
import { MissingHoursDialog } from '../dialogs';
import { SelectionGroup } from '../../../../components/SelectionModal/SelectionModal';
import { DAILY_QUOTA_HOURS } from '../../constants/time';
import '../../styles/manualReportModal.css';

function ManualReportModal({
  isOpen,
  onClose,
  currentDayAbsenceType: _currentDayAbsenceType = null,
  selectedDate = new Date(),
}: ManualReportModalProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'work' | 'absence'>('work');
  const [totalHours, setTotalHours] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [showMissingHoursDialog, setShowMissingHoursDialog] = useState(false);
  const deleteProjectRef = useRef<((projectId: string) => void) | null>(null);

  const projectGroups: SelectionGroup[] = [];

  const taskGroups: SelectionGroup[] = [
    {
      title: 'משימות',
      items: ['UI UX Design', 'Marketing', 'Consulting', 'Design System', 'Branding'],
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
      const missingHours = DAILY_QUOTA_HOURS - totalHours;
      if (missingHours > 0) {
        setShowMissingHoursDialog(true);
        return;
      }
      // TODO: Save the work data to backend/state
      console.log('Saving work data');
    } else {
      // TODO: Save the absence data to backend/state
      console.log('Saving absence data');
    }
    onClose();
  };

  // Calculate displayed hours matching the save gate logic
  const displayedWorkedHours = Math.floor(totalHours);
  const displayedRemainingHours = Math.ceil(
    Math.max(0, DAILY_QUOTA_HOURS - totalHours)
  );

  const handleRequestDeleteProject = (
    projectId: string,
    actualDeleteFn: (projectId: string) => void
  ) => {
    setProjectToDelete(projectId);
    deleteProjectRef.current = actualDeleteFn;
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete && deleteProjectRef.current) {
      deleteProjectRef.current(projectToDelete);
    }
    setShowDeleteConfirm(false);
    setProjectToDelete(null);
    deleteProjectRef.current = null;
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setProjectToDelete(null);
    deleteProjectRef.current = null;
  };

  const handleCompleteMissingHours = () => {
    setShowMissingHoursDialog(false);
  };

  const handleDontShowAgain = () => {
    setShowMissingHoursDialog(false);
    onClose();
  };

  const handleUpdateTotalHours = (hours: number) => {
    setTotalHours(hours);
  };

  const progressPercentage = Math.min(
    (totalHours / DAILY_QUOTA_HOURS) * 100,
    100
  );

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label={t('manualReport.closeAriaLabel')}
          >
            <CloseIcon />
          </button>
          <h2 className="modal-title">{t('manualReport.title')}</h2>
        </div>

        <div className="modal-body">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'work' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('work')}
            >
              {t('manualReport.tabs.work')}
            </button>
            <button
              className={`tab ${activeTab === 'absence' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('absence')}
            >
              {t('manualReport.tabs.absence')}
            </button>
          </div>

          {activeTab === 'work' && (
            <WorkTab
              selectedDate={selectedDate}
              projectGroups={projectGroups}
              taskGroups={taskGroups}
              locationGroups={locationGroups}
              onRequestDeleteProject={handleRequestDeleteProject}
              onUpdateTotalHours={handleUpdateTotalHours}
            />
          )}

          {activeTab === 'absence' && (
            <AbsenceTab selectedDate={selectedDate} />
          )}
        </div>

        <div className="modal-footer">
          {activeTab === 'work' && (
            <>
              <div className="progress-text-container">
                <p className="progress-text progress-text-right">
                  {t('manualReport.progressTextRight', {
                    hours: displayedWorkedHours,
                    quota: DAILY_QUOTA_HOURS,
                  })}
                </p>
                <p className="progress-text progress-text-left">
                  {t('manualReport.progressTextLeft', {
                    remaining: displayedRemainingHours,
                  })}
                </p>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </>
          )}
          <button className="footer-save-btn" onClick={handleSave}>
            {t('common.save')}
          </button>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title={t('dialogs.confirmation.deleteProject.title')}
        message={t('dialogs.confirmation.deleteProject.message')}
        confirmText={t('dialogs.confirmation.deleteProject.confirm')}
        cancelText={t('dialogs.confirmation.deleteProject.cancel')}
      />

      <MissingHoursDialog
        isOpen={showMissingHoursDialog}
        missingHours={DAILY_QUOTA_HOURS - totalHours}
        onComplete={handleCompleteMissingHours}
        onDontShowAgain={handleDontShowAgain}
      />
    </div>
  );
}

export default ManualReportModal;
