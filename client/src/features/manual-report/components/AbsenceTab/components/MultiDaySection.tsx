import { DateValue } from '../../../types/manualReport';
import { calculateDaysBetween } from '../../../utils/date';
import DateRangePicker from './DateRangePicker';
import FileUpload from './FileUpload';

interface MultiDaySectionProps {
  startDate: DateValue;
  endDate: DateValue;
  uploadedFile: File | null;
  fileUploadError: { code: 'FILE_TOO_LARGE' | 'UNSUPPORTED_TYPE' | null; message?: string };
  fileInputRef: React.RefObject<HTMLInputElement>;
  onStartDateChange: (date: DateValue) => void;
  onEndDateChange: (date: DateValue) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
  onBack: () => void;
}

function MultiDaySection({
  startDate,
  endDate,
  uploadedFile,
  fileUploadError,
  fileInputRef,
  onStartDateChange,
  onEndDateChange,
  onFileUpload,
  onRemoveFile,
  onBack,
}: MultiDaySectionProps) {
  return (
    <>
      <div className="multi-day-header">
        <button className="multi-day-back-btn" onClick={onBack}>
          <span className="back-chevron">›</span>
        </button>
        <h3 className="multi-day-title">דיווח היעדרות לפי טווח</h3>
      </div>

      <div className="form-section-title">מלא את הטופס</div>

      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />

      <div className="days-summary">
        סך הכל ימי דיווח:{' '}
        <span className="days-number">
          {calculateDaysBetween(startDate, endDate)} ימים
        </span>
      </div>

      <FileUpload
        uploadedFile={uploadedFile}
        fileUploadError={fileUploadError}
        fileInputRef={fileInputRef}
        onFileUpload={onFileUpload}
        onRemoveFile={onRemoveFile}
      />
    </>
  );
}

export default MultiDaySection;
