import { useState, useCallback, useRef } from 'react';
import { AbsenceType, DateValue, FileUploadError } from '../types/manualReport';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES, FILE_UPLOAD_MESSAGES } from '../constants/fileUpload';
import { useOutsideClick } from './useOutsideClick';

export function useAbsenceReport() {
  const [selectedAbsenceType, setSelectedAbsenceType] =
    useState<AbsenceType | null>(null);
  const [isAbsenceDropdownOpen, setIsAbsenceDropdownOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileUploadError, setFileUploadError] = useState<FileUploadError>({
    code: null,
  });
  const [isMultiDayView, setIsMultiDayView] = useState(false);
  const [startDate, setStartDate] = useState<DateValue>({
    day: 4,
    month: 9,
    year: 2025,
  });
  const [endDate, setEndDate] = useState<DateValue>({
    day: 8,
    month: 9,
    year: 2025,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const absenceDropdownRef = useRef<HTMLDivElement>(null);

  useOutsideClick(
    absenceDropdownRef,
    () => setIsAbsenceDropdownOpen(false),
    isAbsenceDropdownOpen
  );

  const handleFileUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setFileUploadError({ code: null });

      if (file.size > MAX_FILE_SIZE) {
        setFileUploadError({
          code: 'FILE_TOO_LARGE',
          message: FILE_UPLOAD_MESSAGES.FILE_TOO_LARGE,
        });
        setUploadedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setFileUploadError({
          code: 'UNSUPPORTED_TYPE',
          message: FILE_UPLOAD_MESSAGES.UNSUPPORTED_TYPE,
        });
        setUploadedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      setUploadedFile(file);
    },
    []
  );

  const handleRemoveFile = useCallback(() => {
    setUploadedFile(null);
    setFileUploadError({ code: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return {
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
  };
}
