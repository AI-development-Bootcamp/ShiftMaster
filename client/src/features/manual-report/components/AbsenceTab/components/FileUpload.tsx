import { FileUploadError } from '../../../types/manualReport';
import { FileUploadIcon, FileIcon, CloseIcon } from '../../icons';

interface FileUploadProps {
  uploadedFile: File | null;
  fileUploadError: FileUploadError;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

function FileUpload({
  uploadedFile,
  fileUploadError,
  fileInputRef,
  onFileUpload,
  onRemoveFile,
}: FileUploadProps) {
  return (
    <div className="file-upload-section">
      <h3 className="file-upload-title">צירוף קבצים ומסמכים</h3>
      <div
        className="file-upload-area"
        onClick={() => fileInputRef.current?.click()}
      >
        {uploadedFile ? (
          <div className="file-uploaded" onClick={(e) => e.stopPropagation()}>
            <button
              className="file-remove-btn"
              onClick={onRemoveFile}
              aria-label="הסר קובץ"
            >
              <CloseIcon width={20} height={20} />
            </button>
            <FileIcon />
            <p className="file-name">{uploadedFile.name}</p>
            <p className="file-size">
              {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <>
            <FileUploadIcon />
            <p className="file-upload-link">לחץ כאן להעלאת הקובץ</p>
            <p className="file-upload-hint">
              סוג הקבצים הנתמכים : JPG / PNG / PDF
            </p>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={onFileUpload}
        style={{ display: 'none' }}
      />
      {fileUploadError.code && (
        <div
          className="file-upload-error"
          role="alert"
          data-error-code={fileUploadError.code}
        >
          {fileUploadError.message}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
