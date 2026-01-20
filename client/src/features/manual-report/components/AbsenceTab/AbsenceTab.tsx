import { formatDateDisplay } from '../../utils/date';
import { useAbsenceReport } from '../../hooks';
import {
  AbsenceTypeSelector,
  FileUpload,
  MultiDaySection,
} from './components';

interface AbsenceTabProps {
  selectedDate: Date;
}

function AbsenceTab({ selectedDate }: AbsenceTabProps) {
  const {
    selectedAbsenceType,
    setSelectedAbsenceType,
    isAbsenceDropdownOpen,
    setIsAbsenceDropdownOpen,
    uploadedFile,
    fileUploadError,
    isMultiDayView,
    setIsMultiDayView,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    fileInputRef,
    absenceDropdownRef,
    handleFileUpload,
    handleRemoveFile,
  } = useAbsenceReport();

  return (
    <>
      <div className="info-row">
        <div className="date-display">{formatDateDisplay(selectedDate)}</div>
      </div>

      <AbsenceTypeSelector
        selectedType={selectedAbsenceType}
        isOpen={isAbsenceDropdownOpen}
        onToggle={() => setIsAbsenceDropdownOpen(!isAbsenceDropdownOpen)}
        onSelect={(type) => {
          setSelectedAbsenceType(type);
          setIsAbsenceDropdownOpen(false);
        }}
        dropdownRef={absenceDropdownRef}
      />

      {!isMultiDayView ? (
        <>
          <FileUpload
            uploadedFile={uploadedFile}
            fileUploadError={fileUploadError}
            fileInputRef={fileInputRef}
            onFileUpload={handleFileUpload}
            onRemoveFile={handleRemoveFile}
          />

          <div className="divider-section">
            <span className="divider-line"></span>
            <span className="divider-text">או</span>
            <span className="divider-line"></span>
          </div>

          <button
            className="multi-day-btn"
            onClick={() => setIsMultiDayView(true)}
          >
            <span className="multi-day-chevron">‹</span>
            <span>לדווח על היעדרות יותר מיום אחד</span>
          </button>
        </>
      ) : (
        <MultiDaySection
          startDate={startDate}
          endDate={endDate}
          uploadedFile={uploadedFile}
          fileUploadError={fileUploadError}
          fileInputRef={fileInputRef}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onFileUpload={handleFileUpload}
          onRemoveFile={handleRemoveFile}
          onBack={() => setIsMultiDayView(false)}
        />
      )}
    </>
  );
}

export default AbsenceTab;
